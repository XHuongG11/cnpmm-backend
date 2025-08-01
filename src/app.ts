import express from "express";
import StudentRoute from "./routes/student.route.js";
import AuthRoute from "./routes/auth.route.js";
import cors from "cors";
import { authenticateToken } from "./middleware/authenticateToken.js";

const app = express();

app.use(express.urlencoded({ extended: true }));

// cors
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// gan routes
app.use("/api/auth", AuthRoute);
app.use("/api/students", authenticateToken, StudentRoute);

export default app;
