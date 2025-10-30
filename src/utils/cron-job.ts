import cron from "node-cron";
import axios from "axios";
import config from "../config";

// CRON JOB — runs every 4 minutes
// This cron job is setup in other to bypass the idle time when deployed on render free hosting
cron.schedule("*/4 * * * *", async () => {
  try {
    const response = await axios.get(`${config.APP_URL}/health`);
    console.log(
      `[CRON] Health check successful at ${new Date().toISOString()}`,
      response.data
    );
    //eslint-disable-next-line
  } catch (error: any) {
    console.error(
      `[CRON] Health check failed at ${new Date().toISOString()}:`,
      error.message
    );
  }
});
