import nunjucks from "nunjucks";
import { Application } from "express";

export function setupNunjucks(app: Application, viewsPath: string): void {

  const configureOptions: nunjucks.ConfigureOptions = {
    autoescape: true,
    express: app,
    // Don't cache so we can make changes to templates without restarting the server
    noCache: true,
  };
  const viewPaths = [viewsPath, "node_modules/govuk-frontend/dist/"];
  nunjucks.configure(viewPaths, configureOptions);
}
