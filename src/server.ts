import app from "./app.js";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import bcrypt from "bcryptjs";
import Admin from "./models/admin.model.js";
import mongoose from "mongoose";

dotenv.config();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.deleteMany({}); // xóa admin cũ
  const admin = new Admin({
    username: "admin",
    password: hashedPassword,
  });
  await admin.save();
  console.log("Admin created with hashed password");
  mongoose.disconnect();
}

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
      // createAdmin();
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer().catch((error) => {
  console.error("Error in startServer:", error);
});
