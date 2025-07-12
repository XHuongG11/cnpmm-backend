// src/app.ts
import express from "express";

// src/routes/student.route.ts
import { Router } from "express";

// src/models/student.model.ts
import mongoose, { Schema } from "mongoose";

// src/enums/EGender.ts
var EGender = /* @__PURE__ */ ((EGender2) => {
  EGender2["MALE"] = "Male";
  EGender2["FEMALE"] = "Female";
  return EGender2;
})(EGender || {});
var EGender_default = EGender;

// src/enums/EExamEligibility.ts
var EExamEligibility = /* @__PURE__ */ ((EExamEligibility2) => {
  EExamEligibility2["ACTIVE"] = "active";
  EExamEligibility2["SUSPENDED"] = "suspended";
  EExamEligibility2["EXPELLED"] = "expelled";
  return EExamEligibility2;
})(EExamEligibility || {});
var EExamEligibility_default = EExamEligibility;

// src/models/base.model.ts
function basePlugin(schema) {
  schema.add({ isDeleted: { type: Boolean, default: false } });
  schema.set("timestamps", true);
}

// src/models/student.model.ts
var StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  currentInfo: {
    fullName: String,
    identityCard: String,
    dob: Date,
    gender: {
      type: String,
      enum: EGender_default
    },
    email: String,
    phone: String,
    studentClass: String,
    origin: String,
    major: String,
    facility: String,
    imageUrl: String
  },
  infoHistory: [{ type: Schema.Types.ObjectId, ref: "InfoHistory" }],
  examParticipations: [{ type: Schema.Types.ObjectId, ref: "ExamSession" }],
  status: {
    examEligibility: {
      type: String,
      enum: EExamEligibility_default
    },
    // active, suspended, expelled
    reason: String
  }
});
StudentSchema.plugin(basePlugin);
StudentSchema.set("toJSON", {
  transform: function(doc, ret) {
    if (ret.currentInfo.dob) {
      ret.currentInfo.dob = new Date(ret.currentInfo.dob).toISOString().split("T")[0];
    }
    return ret;
  }
});
var Student = mongoose.model("Student", StudentSchema);
var student_model_default = Student;

// src/utils/responseHelper.ts
function successResponse(res, data) {
  res.status(200).json({
    status: "success",
    data
  });
}
function errorResponse(res, statusCode = 400, message) {
  res.status(statusCode).json({
    status: "error",
    message
  });
}

// src/controller/student.controller.ts
var getAreasByDate = async (req, res) => {
  const date = req.params.date;
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await student_model_default.aggregate([
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
    return errorResponse(res, 500, "Error fetching students by date");
  }
};
var getShiftsByDateAndArea = async (req, res) => {
  try {
    const { date, area } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await student_model_default.aggregate([
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
    return errorResponse(res, 500, "Error fetching shifts by date and area");
  }
};
var getRoomsByDateAreaAndShift = async (req, res) => {
  try {
    const { date, area, shift } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await student_model_default.aggregate([
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
      "Error fetching rooms by date, area and shift"
    );
  }
};
var getStudentsByDateAreaShiftAndRoom = async (req, res) => {
  try {
    const { date, area, shift, room } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const data = await student_model_default.aggregate([
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
      "Error fetching students by date, area, shift and room"
    );
  }
};
var searchByFullName = async (req, res) => {
  try {
    const fullName = req.query.fullName === void 0 ? "" : req.query.fullName;
    console.log(fullName);
    const result = await student_model_default.find(
      {
        "currentInfo.fullName": { $regex: fullName, $options: "i" }
      },
      { currentInfo: 1, studentId: 1, _id: 0 }
    );
    console.log(result);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 500, "Error search by name");
  }
};
var searchByStudentID = async (req, res) => {
  try {
    const studentId = req.params.studentId === void 0 ? "" : req.params.studentId;
    console.log(studentId);
    const result = await student_model_default.findOne(
      { studentId },
      { currentInfo: 1, studentId: 1, _id: 0 }
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 500, "Error search by name");
  }
};
var StudentController = {
  getAreasByDate,
  getShiftsByDateAndArea,
  getRoomsByDateAreaAndShift,
  getStudentsByDateAreaShiftAndRoom,
  searchByFullName,
  searchByStudentID
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
router.get("/search/", StudentController.searchByFullName);
router.get("/:studentId", StudentController.searchByStudentID);
var student_route_default = router;

// src/app.ts
import cors from "cors";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var corsOption = {
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "applicaton/json"]
};
app.use(cors(corsOption));
app.use("/api/students", student_route_default);
var app_default = app;

// src/server.ts
import dotenv from "dotenv";

// src/config/db.ts
import mongoose2 from "mongoose";
var connectToDatabase = async () => {
  try {
    await mongoose2.connect(process.env.URL + "/" + process.env.DATABASE_NAME);
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
