import express from "express";
import StudentRoute from "./routes/student.route.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// gan routes
app.use("/api/students", StudentRoute);

export default app;
