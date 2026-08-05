import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./config/db.js";

async function startServer() {
  try {
    await checkDatabaseConnection();
    console.log("Database connection & auto-migrations verified.");
  } catch (err) {
    console.error("Database connection error on startup:", err.message);
  }

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

startServer();
