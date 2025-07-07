import { Router } from "express";
import { StudentController } from "../controller/student.controller.js"; // Adjust the import path as necessary

const router = Router();

router.get("/", StudentController.getAllStudents);

export default router;
