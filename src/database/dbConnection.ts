import mongoose from "mongoose";
import config from "../config";

export async function Dbconnection() {
  await mongoose.connect(config.MONGO_URI, {} as any);
  console.log("MongoDB connected");
}
