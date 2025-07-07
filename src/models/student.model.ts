import mongoose from "mongoose";
import ExamStatus from "./examStatus.model.js";
import ExamParticipation from "./examParticipation.model.js";
import EGender from "../enums/EGender.js";

const StudentInfo = new mongoose.Schema(
  {
    fullName: String,
    dob: Date,
    gender: {
      type: String,
      enum: EGender,
    },
    studentClass: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const StudentInfoHistory = new mongoose.Schema(
  {
    ...StudentInfo.obj,
    updatedAt: Date,
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    currentInfo: StudentInfo,
    infoHistory: [StudentInfoHistory],
    examParticipations: [ExamParticipation],
    status: ExamStatus,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "students" }
);

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

export { Student, StudentInfo, StudentInfoHistory };
