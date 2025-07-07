import mongoose from "mongoose";
import Inviligator from "./inviligator.model.js";
import ELevelViolation from "../enums/ELevelViolation.js";

const ViolationReport = new mongoose.Schema(
  {
    hasViolation: Boolean,
    level: {
      type: String,
      enum: Object.values(ELevelViolation),
    },
    description: String,
    invigilators: [Inviligator],
    notes: String,
  },
  { _id: false }
);

export default ViolationReport;
