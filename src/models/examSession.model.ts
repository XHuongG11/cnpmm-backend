import mongoose, { Schema } from "mongoose";
import basePlugin from "./base.model.js";

const ExamSessionSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  examName: String,
  examDate: Date,
  area: String,
  room: String,
  shift: String,
  roomInvigilators: [{ type: Schema.Types.ObjectId, ref: "Invigilator" }],
  violation: { type: Schema.Types.ObjectId, ref: "Violation" },
});

ExamSessionSchema.plugin(basePlugin);

const ExamSession = mongoose.model("ExamSession", ExamSessionSchema);

export default ExamSession;
