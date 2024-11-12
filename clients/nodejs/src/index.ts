import express, { Application, NextFunction, Request, Response } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "node:path";
import { logger } from "./logger";
import { nunjucks } from "./utils/nunjucks";
import { auth } from "./auth";
import { getNodeEnv, getServiceUrl } from "./utils/config"; 
import { AuthenticatedUser, isAuthenticated } from "./utils/helpers";

export const app: Application = express();
const port = process.env.NODE_PORT || 8080;

declare module 'express-session' {
  interface SessionData {
    user: any,
    identity: any;
  }
};

(async () => {
  // Configure Nunjucks view engine
  const nunjucksPath = path.join(__dirname, "./views");
  nunjucks(app, nunjucksPath);

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

  // Configure OpenID Connect Authentication middleware
  app.use(
    await auth({
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      tokenAuthMethod: process.env.OIDC_TOKEN_AUTH_METHOD,
      privateKey: process.env.OIDC_PRIVATE_KEY,
      idTokenSigningAlg: process.env.OIDC_ID_TOKEN_SIGNING_ALG,
      discoveryEndpoint: process.env.OIDC_ISSUER_DISCOVERY_ENDPOINT,
      authorizeRedirectUri: process.env.OIDC_AUTHORIZE_REDIRECT_URI,
      postLogoutRedirectUri: process.env.OIDC_LOGOUT_REDIRECT_URI,
      identityVerificationPublicKey: process.env.IV_PUBLIC_KEY,
      identityVerificationIssuer: process.env.IV_ISSUER,
      uiLocales: process.env.UI_LOCALES,
      auth_vtr: process.env.AUTH_VECTOR_OF_TRUST,
      idv_vtr: process.env.IDENTITY_VECTOR_OF_TRUST
    })
  );

  // Redirect root to start
  app.get("/", (req: Request, res: Response) => {
    res.redirect("/start");
  });

  app.get("/start", (req: Request, res: Response) => {
    res.render("start.njk", 
      {
        authenticated: isAuthenticated(req, res),
        serviceName: "Sample service",
        // GOV.UK header config
        homepageUrl: "https://gov.uk",
        serviceUrl: `${getServiceUrl()}`
      }
    );
  });

  // Application routes
  app.get("/home", AuthenticatedUser, (req: Request, res: Response) => {
    res.render(
      "home.njk", 
      { 
        authenticated: true,
        // page config
        serviceName: "Sample service",  
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

  const server = await app.listen(port);
  const listeningAddress = server.address();
  if (listeningAddress && typeof listeningAddress === "object") {
    logger.info(`Server listening ${listeningAddress.address}:${listeningAddress.port}`);
    logger.info(`http://localhost:${listeningAddress.port}`);     
  }
})();
