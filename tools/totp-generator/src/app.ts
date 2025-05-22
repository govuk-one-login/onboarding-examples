import express, { Application, Express, NextFunction, Request, Response } from "express";
import { totpController } from "./components/totp/totp-controller.js";

const createApp = (): Application => {
 
  const app: Express = express();

  // Configure body-parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  app.get("/totp-generator", (req: Request, res: Response, next: NextFunction) => 
    totpController(req, res)
  );

  app.get('/', (req: Request, res: Response) => {
    res.send(`
      <h1>Time based one time password (TOTP) generator </h1>
      <p>Generate a one time password by making a GET request to: <code>/totp-generator?secret=your-secret-key</code></p>
      <p>Example: <a href="./totp-generator?secret=Y3BUOUHH4CB7JQNQGYRSTUC5PAHYRJAJ">./totp-generator?secret=Y3BUOUHH4CB7JQNQGYRSTUC5PAHYRJAJ</a></p>
      <p><strong>Note:</strong> Always use HTTPS in production to protect the secret and TOTP value</p>
    `);
  });

  return app;
};

export { createApp };