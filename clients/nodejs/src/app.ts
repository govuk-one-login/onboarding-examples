import express, { Application, Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "node:path";
import { setupNunjucks } from "./helpers/nunjucks.js";
import { Config } from "./config.js";
import { AuthenticatedUser, isAuthenticated } from "./helpers/user-status.js";
import { authorizeController } from "./components/authorize/authorize-controller.js";
import { callbackController } from "./components/callback/callback-controller.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logoutController } from "./components/logout/logout-controller.js";

declare module 'express-session' {
  interface SessionData {
    user: any,
    identity: any;
    landingPage?: boolean;
    email?: boolean;
  }
};

const createApp = (): Application => {
  const app: Express = express();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Configure Nunjucks view engine
  const nunjucksPath = path.join(__dirname, "./views");
  setupNunjucks(app, nunjucksPath);

  // Configure serving static assets like images and css
  const publicPath = path.join(__dirname, "../public");
  app.use(express.static(publicPath));

  // Configure body-parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Configure parsing cookies - required for storing nonce in authentication
  app.use(cookieParser());

  // Set up a session to track whether the user is logged in
  app.use(session({
    name: "simple-session",
    secret: "this-is-a-secret", 
    cookie: {
      maxAge: 1000 * 120 * 60, // 2 hours
      secure: false,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true
  }));

  const clientConfig = Config.getInstance();

  app.get("/oidc/login", (req: Request, res: Response, next: NextFunction) => 
    authorizeController(req, res, next, false)
  );

  app.get("/oidc/verify", (req: Request, res: Response, next: NextFunction) => 
    authorizeController(req, res, next, true)
  );

  app.get("/oidc/authorization-code/callback", (req: Request, res: Response, next: NextFunction) => 
    callbackController(req, res, next)
);
  
  app.get("/", (req: Request, res: Response) => {
    res.redirect("/start");
  });

  app.get("/oidc/logout", (req: Request, res: Response, next: NextFunction) => 
    logoutController(req, res, next)
  );

  app.get("/landing-page", (req: Request, res: Response, next: NextFunction) => {
    // set flag to say user came via post office landing page
    res.cookie("post-office", true, {
      httpOnly: true,
    });
    authorizeController(req, res, next, false)
  });

  app.get("/post-office-return", AuthenticatedUser,(req: Request, res: Response) => {
    res.cookie("post-office","", {
      maxAge: 0,
      httpOnly: true
    });

    res.render(
      "post-office-return.njk", 
      { 
        authenticated: true,
        // page config
        serviceName: "{EXAMPLE_SERVICE}",
        // Service header config
        oneLoginLink: clientConfig.getNodeEnv() == "development" ? "https://home.integration.account.gov.uk/" : "https://home.account.gov.uk/",
        homepageLink: "https://www.gov.uk/",
        signOutLink: "http://localhost:8080/oidc/logout"
      }
    );
  });

  app.get("/signed-out", (req: Request, res: Response) => {
    res.render("logged-out.njk",
      {
        serviceName: "{EXAMPLE_SERVICE}"
      }
    );
  });

  app.get("/start", (req: Request, res: Response) => {
    res.render("start.njk", 
      {
        authenticated: isAuthenticated(req, res),
        serviceName: "{EXAMPLE_SERVICE}",
        // GOV.UK header config
        homepageUrl: "https://gov.uk",
        serviceUrl: `${clientConfig.getServiceUrl()}`
      }
    );
  });

  app.get("/home", AuthenticatedUser, (req: Request, res: Response) => {
    res.render(
      "home.njk", 
      { 
        authenticated: true,
        identitySupported: clientConfig.getIdentitySupported(),
        // page config
        serviceName: "{EXAMPLE_SERVICE}",
        resultData: req.session.user,
        // Service header config
        oneLoginLink: clientConfig.getNodeEnv() == "development" ? "https://home.integration.account.gov.uk/" : "https://home.account.gov.uk/",
        homepageLink: "https://www.gov.uk/",
        signOutLink: "http://localhost:8080/oidc/logout"
      }
    );
  });

  // Generic error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    res.render("error.njk", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  });

  return app;
};

export { createApp };
