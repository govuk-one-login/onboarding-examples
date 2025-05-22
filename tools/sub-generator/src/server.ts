import { createApp } from "./app.js";
import { logger } from "./logger.js";
import * as dotenv from 'dotenv';

// Load the .env file
dotenv.config();
// Now use environment variables with fallbacks
const port = process.env.NODE_PORT || 8080;

(async () => {
  const app = createApp();

  app.listen(port, () => {
    logger.info(`sub-generator is running at http://localhost:${port}`);
  });
})();
