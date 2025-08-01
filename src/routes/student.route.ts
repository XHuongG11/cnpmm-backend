import { Router } from "express";
import { StudentController } from "../controller/student.controller.js";

const router = Router();

router.get("/search/:date/areas", StudentController.getAreasByDate);
router.get(
  "/search/:date/:area/shifts",
  StudentController.getShiftsByDateAndArea
);
router.get(
  "/search/:date/:area/:shift/:room/students",
  StudentController.getStudentsInRoom
);

router.get("/search/", StudentController.searchByFullName);
router.get("/:studentId", StudentController.searchByStudentID);

export default router;
