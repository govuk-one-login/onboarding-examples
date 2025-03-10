import { createApp } from "./app.js";
import { logger } from "./logger.js";
import * as dotenv from 'dotenv';

// Load the .env file
dotenv.config();

const port = process.env.NODE_PORT || 8080;

(async () => {
  const app = createApp();

  app.listen(port, () => {
    logger.info(`[server]: Server is running at http://localhost:${port}`);
  });
})();
