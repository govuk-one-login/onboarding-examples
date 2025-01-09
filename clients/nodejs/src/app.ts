import express, { Application, Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "node:path";
import { setupNunjucks } from "./utils/nunjucks.js";
import { getNodeEnv, getServiceUrl } from "./utils/config.js"; 
import { AuthenticatedUser, isAuthenticated } from "./utils/helpers.js";
import { authorizeController } from "./components/authorize/authorize-controller.js";
import { callbackController } from "./components/callback/callback-controller.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logoutController } from "./components/logout/logout-controller.js";

declare module 'express-session' {
  interface SessionData {
    user: any,
    identity: any;
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


  app.get("/oidc/login", (req: Request, res: Response, next: NextFunction) => 
    authorizeController(req, res, next, false)
  );

  app.get("/oidc/verify", (req: Request, res: Response, next: NextFunction) => 
    authorizeController(req, res, next, true)
  );

  app.get("/oidc/authorization-code/callback", callbackController);
  
  app.get("/", (req: Request, res: Response) => {
    res.redirect("/start");
  });

  app.get("/oidc/logout", (req: Request, res: Response, next: NextFunction) => 
    logoutController(req, res, next)
  );

  app.get("/signed-out", (req: Request, res: Response) => {
    res.render("logged-out.njk");
  });

  app.get("/start", (req: Request, res: Response) => {
    res.render("start.njk", 
      {
        authenticated: isAuthenticated(req, res),
        serviceName: "Example Service",
        // GOV.UK header config
        homepageUrl: "https://gov.uk",
        serviceUrl: `${getServiceUrl()}`
      }
    );
  });

  app.get("/home", AuthenticatedUser, (req: Request, res: Response) => {
    res.render(
      "home.njk", 
      { 
        authenticated: true,
        // page config
        serviceName: "Example Service",  
        resultData: req.session.user,
        // Service header config
        isProduction: getNodeEnv() == "development" ? false : true
      });
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