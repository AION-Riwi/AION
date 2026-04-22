//

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI no está definida");
}

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error conectando MongoDB:", error);
    process.exit(1);
  }
};
