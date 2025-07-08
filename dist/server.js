// src/app.ts
import express from "express";

// src/routes/student.route.ts
import { Router } from "express";

// src/models/student.model.ts
import mongoose5 from "mongoose";

// src/models/examStatus.model.ts
import mongoose from "mongoose";

// src/enums/EExamEligibility.ts
var EExamEligibility = /* @__PURE__ */ ((EExamEligibility2) => {
  EExamEligibility2["ACTIVE"] = "active";
  EExamEligibility2["SUSPENDED"] = "suspended";
  EExamEligibility2["EXPELLED"] = "expelled";
  return EExamEligibility2;
})(EExamEligibility || {});
var EExamEligibility_default = EExamEligibility;

// src/models/examStatus.model.ts
var ExamStatus = new mongoose.Schema(
  {
    examEligibility: {
      type: String,
      enum: EExamEligibility_default
    },
    // active, suspended, expelled
    reason: String
  },
  { _id: false }
);
var examStatus_model_default = ExamStatus;

// src/models/examParticipation.model.ts
import mongoose4 from "mongoose";

// src/models/violationReport.model.ts
import mongoose3 from "mongoose";

// src/models/inviligator.model.ts
import mongoose2 from "mongoose";
var Invigilator = new mongoose2.Schema(
  {
    staffId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  { _id: false }
);
var inviligator_model_default = Invigilator;

// src/enums/ELevelViolation.ts
var ELevelViolation = /* @__PURE__ */ ((ELevelViolation2) => {
  ELevelViolation2["KHIEN_TRACH"] = "Khi\u1EC3n tr\xE1ch";
  ELevelViolation2["CANH_CAO"] = "C\u1EA3nh c\xE1o";
  ELevelViolation2["DING_CHI"] = "\u0110\xECnh ch\u1EC9";
  ELevelViolation2["DUOI_HOC"] = "\u0110u\u1ED5i h\u1ECDc";
  return ELevelViolation2;
})(ELevelViolation || {});
var ELevelViolation_default = ELevelViolation;

// src/models/violationReport.model.ts
var ViolationReport = new mongoose3.Schema(
  {
    hasViolation: Boolean,
    level: {
      type: String,
      enum: Object.values(ELevelViolation_default)
    },
    description: String,
    invigilators: [inviligator_model_default],
    notes: String
  },
  { _id: false }
);
var violationReport_model_default = ViolationReport;

// src/models/examParticipation.model.ts
var ExamParticipation = new mongoose4.Schema(
  {
    examDate: Date,
    area: String,
    room: String,
    shift: String,
    violation: violationReport_model_default
  },
  { _id: false }
);
var examParticipation_model_default = ExamParticipation;

// src/enums/EGender.ts
var EGender = /* @__PURE__ */ ((EGender2) => {
  EGender2["MALE"] = "Male";
  EGender2["FEMALE"] = "Female";
  return EGender2;
})(EGender || {});
var EGender_default = EGender;

// src/models/student.model.ts
var StudentInfo = new mongoose5.Schema(
  {
    fullName: String,
    dob: Date,
    gender: {
      type: String,
      enum: EGender_default
    },
    studentClass: String,
    email: String,
    phone: String
  },
  { _id: false }
);
var StudentInfoHistory = new mongoose5.Schema(
  {
    ...StudentInfo.obj,
    updatedAt: Date
  },
  { _id: false }
);
var StudentSchema = new mongoose5.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true
    },
    currentInfo: StudentInfo,
    infoHistory: [StudentInfoHistory],
    examParticipations: [examParticipation_model_default],
    status: examStatus_model_default,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: "students" }
);
StudentSchema.set("toJSON", {
  transform: function(doc, ret) {
    if (ret.currentInfo.dob) {
      ret.currentInfo.dob = new Date(ret.currentInfo.dob).toISOString().split("T")[0];
    }
    return ret;
  }
});
var Student = mongoose5.model("Student", StudentSchema);

// src/utils/responseHelper.ts
function successResponse(res, data) {
  res.status(200).json({
    status: "success",
    data
  });
}
function errorResponse(res, statusCode = 400, message, errors) {
  res.status(statusCode).json({
    status: "error",
    message,
    errors
  });
}

// src/controller/student.controller.ts
var getAreasByDate = async (req, res) => {
  const date = req.params.date;
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` }
        }
      },
      {
        $group: {
          _id: "$examParticipations.area"
        }
      },
      { $project: { _id: 0, area: "$_id" } },
      { $sort: { area: 1 } }
    ]).exec();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error fetching students by date",
      error instanceof Error ? error.message : String(error)
    );
  }
};
var getShiftsByDateAndArea = async (req, res) => {
  try {
    const { date, area } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` },
          "examParticipations.area": area
        }
      },
      {
        $group: {
          _id: "$examParticipations.shift"
        }
      },
      { $project: { _id: 0, shift: "$_id" } },
      { $sort: { shift: 1 } }
    ]).exec();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error fetching shifts by date and area",
      error instanceof Error ? error.message : String(error)
    );
  }
};
var getRoomsByDateAreaAndShift = async (req, res) => {
  try {
    const { date, area, shift } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` },
          "examParticipations.area": area,
          "examParticipations.shift": shift
        }
      },
      {
        $group: {
          _id: "$examParticipations.room"
        }
      },
      { $project: { _id: 0, room: "$_id" } },
      { $sort: { room: 1 } }
    ]).exec();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error fetching rooms by date, area and shift",
      error instanceof Error ? error.message : String(error)
    );
  }
};
var getStudentsByDateAreaShiftAndRoom = async (req, res) => {
  try {
    const { date, area, shift, room } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` },
          "examParticipations.area": area,
          "examParticipations.shift": shift,
          "examParticipations.room": room
        }
      },
      { $project: { _id: 0, mssv: "$studentId", currentInfo: "$currentInfo" } }
    ]).exec();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error fetching students by date, area, shift and room",
      error instanceof Error ? error.message : String(error)
    );
  }
};
var StudentController = {
  getAreasByDate,
  getShiftsByDateAndArea,
  getRoomsByDateAreaAndShift,
  getStudentsByDateAreaShiftAndRoom
};

// src/routes/student.route.ts
var router = Router();
router.get("/search/:date/areas", StudentController.getAreasByDate);
router.get(
  "/search/:date/:area/shifts",
  StudentController.getShiftsByDateAndArea
);
router.get(
  "/search/:date/:area/:shift/rooms",
  StudentController.getRoomsByDateAreaAndShift
);
router.get(
  "/search/:date/:area/:shift/:room/students",
  StudentController.getStudentsByDateAreaShiftAndRoom
);
var student_route_default = router;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", student_route_default);
var app_default = app;

// src/server.ts
import dotenv from "dotenv";

// src/config/db.ts
import mongoose6 from "mongoose";
var connectToDatabase = async () => {
  try {
    await mongoose6.connect(process.env.URL + "/" + process.env.DATABASE_NAME);
    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

// src/server.ts
dotenv.config();
var startServer = async () => {
  try {
    await connectToDatabase();
    app_default.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
startServer().catch((error) => {
  console.error("Error in startServer:", error);
});
