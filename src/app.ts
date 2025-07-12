import express from "express";
import StudentRoute from "./routes/student.route.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors
const corsOption = {
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "applicaton/json"],
};

app.use(cors(corsOption));

// gan routes
app.use("/api/students", StudentRoute);

export default app;
