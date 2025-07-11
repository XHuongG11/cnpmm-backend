import mongoose, { Schema } from "mongoose";
import EGender from "../enums/EGender.js";
import EExamEligibility from "../enums/EExamEligibility.js";
import basePlugin from "./base.model.js";

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  currentInfo: {
    fullName: String,
    identityCard: String,
    dob: Date,
    gender: {
      type: String,
      enum: EGender,
    },
    email: String,
    phone: String,
    studentClass: String,
    origin: String,
    major: String,
    facility: String,
    imageUrl: String,
  },
  infoHistory: [{ type: Schema.Types.ObjectId, ref: "InfoHistory" }],
  examParticipations: [{ type: Schema.Types.ObjectId, ref: "ExamSession" }],
  status: {
    examEligibility: {
      type: String,
      enum: EExamEligibility,
    }, // active, suspended, expelled
    reason: String,
  },
});

StudentSchema.plugin(basePlugin);

// format return JSON
StudentSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.currentInfo.dob) {
      ret.currentInfo.dob = new Date(ret.currentInfo.dob)
        .toISOString()
        .split("T")[0];
    }
    return ret;
  },
});

const Student = mongoose.model("Student", StudentSchema);

export default Student;
