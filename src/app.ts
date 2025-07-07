import express from "express";
import StudentRoute from "./routes/student.route.js"; // Adjust the import path as necessary

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// gan routes
app.use("/api/students", StudentRoute);

export default app;
