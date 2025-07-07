import mongoose from "mongoose";
import ViolationReport from "./violationReport.model.js";

const ExamParticipation = new mongoose.Schema(
  {
    examDate: Date,
    area: String,
    room: String,
    shift: String,
    violation: ViolationReport,
  },
  { _id: false }
);

export default ExamParticipation;
