import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
console.log("URI:", process.env.MONGODB_URI);

const connectDB = async ()=>{
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 20000,
    })
    console.log(`\n MOngoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error!",error);
    process.exit(1)
  }
}

export default connectDB