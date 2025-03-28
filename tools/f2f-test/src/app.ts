import express, { Application, Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { setupNunjucks } from "./helpers/nunjucks.js";
import { Config } from "./config.js";
import { authorizeController } from "./components/authorize/authorize-controller.js";
import { callbackController } from "./components/callback/callback-controller.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

  const clientConfig = Config.getInstance();

  app.get("/oidc/login", (req: Request, res: Response, next: NextFunction) => 
    authorizeController(req, res, next)
  );

  app.get("/oidc/authorization-code/callback", callbackController);
  
  app.get("/", (req: Request, res: Response) => {
    // Send user to fake email as default page
    res.redirect("/email");
  });

  app.get("/email", (req: Request, res: Response) => {
    res.render(
      "email.njk",
      {
        loginLink: `${clientConfig.getServiceUrl()}/oidc/login`
      }
    );
  });

  return app;
};

export { createApp };
