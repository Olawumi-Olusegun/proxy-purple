import mongoose from "mongoose";
import config from "../config";
import { HttpError } from "../utils/http-error";
import logger from "../utils/logger";

let RETRY_COUNT = 0;
const MAX_RETRIES = 5;

const MONGO_URI = config.MONGO_URI;

export async function DbConnection() {
  if (!MONGO_URI) {
    throw new HttpError("MONGO_URI is not defined", 500);
  }

  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    logger.error(error);
    console.log("MongoDB connection failed");
    if (RETRY_COUNT < MAX_RETRIES) {
      RETRY_COUNT++;
      setTimeout(DbConnection, 5000);
    } else {
      console.log("MongoDB connection failed");
      process.exit(1);
    }
  }
}

// Event listeners for mongoose connection
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  logger.info("Mongoose disconnected");
});

// Handle graceful shutdown using async/await
export const gracefulShutdown = (error: Error, origin: string) => {
  logger.info(`${origin} : ${error}`);
  console.error(`Caught ${origin}:`, error);
  console.log("Shutting down the server...");
  process.exit(1); // exit with failure
};

process.on("SIGINT", async (error: Error) => {
  try {
    await mongoose.connection.close();
    gracefulShutdown(error, "SIGINT");
  } catch (error) {
    logger.info(`SIGINT : ${error}`);
    process.exit(1);
  }
});
