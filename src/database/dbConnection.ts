import mongoose from "mongoose";
import config from "../config";

export async function Dbconnection() {
  await mongoose.connect(config.mongoUri, {} as any);
  console.log("MongoDB connected");
}
