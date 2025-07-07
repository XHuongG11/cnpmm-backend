import mongoose from "mongoose";
import EExamEligibility from "../enums/EExamEligibility.js";

const ExamStatus = new mongoose.Schema(
  {
    examEligibility: {
      type: String,
      enum: EExamEligibility,
    }, // active, suspended, expelled
    reason: String,
  },
  { _id: false }
);

export default ExamStatus;
