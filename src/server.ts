import app from "./app.js";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer().catch((error) => {
  console.error("Error in startServer:", error);
});
