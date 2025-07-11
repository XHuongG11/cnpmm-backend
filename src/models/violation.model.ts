import mongoose, { Schema } from "mongoose";
import ELevelViolation from "../enums/ELevelViolation.js";
import basePlugin from "./base.model.js";

const ViolationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: Object.values(ELevelViolation),
  },
  description: String,
  reportInvigilators: [{ type: Schema.Types.ObjectId, ref: "Invigilator" }],
  notes: String,
});

ViolationSchema.plugin(basePlugin);

const Violation = mongoose.model("Violation", ViolationSchema);
export default Violation;
