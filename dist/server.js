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

// src/models/examSession.model.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var ExamSessionSchema = new mongoose2.Schema({
  _id: Schema2.Types.ObjectId,
  examName: String,
  examDate: Date,
  area: String,
  room: String,
  shift: String,
  roomInvigilators: [{ type: Schema2.Types.ObjectId, ref: "Invigilator" }],
  violation: { type: Schema2.Types.ObjectId, ref: "Violation" }
});
ExamSessionSchema.plugin(basePlugin);
var ExamSession = mongoose2.model("ExamSession", ExamSessionSchema);
var examSession_model_default = ExamSession;

// src/controller/student.controller.ts
var getAreasByDate = async (req, res) => {
  const date = req.params.date;
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const start = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));
    const data = await examSession_model_default.aggregate([
      {
        $match: {
          examDate: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $group: {
          _id: "$area"
        }
      },
      { $project: { _id: 0, area: "$_id" } },
      { $sort: { area: 1 } }
    ]).exec();
    const areaList = data.map((item) => item.area);
    return successResponse(res, areaList);
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
    const start = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));
    const data = await examSession_model_default.aggregate([
      {
        $match: {
          examDate: {
            $gte: start,
            $lt: end
          },
          area
        }
      },
      {
        $group: {
          _id: "$shift",
          rooms: { $addToSet: "$room" }
        }
      },
      { $project: { _id: 0, shift: "$_id", rooms: 1 } },
      { $sort: { shift: 1 } }
    ]).exec();
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 500, "Error fetching shifts by date and area");
  }
};
var getStudentsInRoom = async (req, res) => {
  try {
    const { date, area, shift, room } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }
    const start = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));
    const [data] = await student_model_default.aggregate([
      // Nối dữ liệu từ bảng ExamSession
      {
        $lookup: {
          from: "examsessions",
          localField: "examParticipations",
          foreignField: "_id",
          as: "examParticipationsData"
        }
      },
      { $unwind: "$examParticipationsData" },
      {
        $match: {
          "examParticipationsData.examDate": { $gte: start, $lt: end },
          "examParticipationsData.area": area,
          "examParticipationsData.shift": shift,
          "examParticipationsData.room": room
        }
      },
      {
        $facet: {
          students: [
            {
              $project: {
                _id: 0,
                mssv: "$studentId",
                currentInfo: "$currentInfo"
              }
            }
          ],
          subjectName: [
            {
              $group: {
                _id: null,
                examName: { $first: "$examParticipationsData.examName" }
              }
            }
          ],
          total: [{ $count: "totalStudent" }]
        }
      },
      {
        $project: {
          students: 1,
          subjectName: { $arrayElemAt: ["$subjectName.examName", 0] },
          total: { $arrayElemAt: ["$total.totalStudent", 0] }
        }
      }
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
    const result = await student_model_default.find(
      {
        "currentInfo.fullName": { $regex: fullName, $options: "i" }
      },
      { currentInfo: 1, studentId: 1, _id: 0 }
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 500, "Error search by name");
  }
};
var searchByStudentID = async (req, res) => {
  try {
    const studentId = req.params.studentId === void 0 ? "" : req.params.studentId;
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
  getStudentsInRoom,
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
  "/search/:date/:area/:shift/:room/students",
  StudentController.getStudentsInRoom
);
router.get("/search/", StudentController.searchByFullName);
router.get("/:studentId", StudentController.searchByStudentID);
var student_route_default = router;

// src/routes/auth.route.ts
import { Router as Router2 } from "express";

// src/controller/auth.controller.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// src/models/admin.model.ts
import mongoose3 from "mongoose";
var AdminSchema = new mongoose3.Schema({
  username: String,
  password: String
});
AdminSchema.plugin(basePlugin);
var Admin = mongoose3.model("Admin", AdminSchema);
var admin_model_default = Admin;

// src/controller/auth.controller.ts
var login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await admin_model_default.findOne({ username });
    if (!admin) return errorResponse(res, 401, "Sai th\xF4ng tin \u0111\u0103ng nh\u1EADp");
    const hashedPassword = admin.get("password");
    if (!hashedPassword || typeof hashedPassword !== "string") {
      return errorResponse(res, 500, "Kh\xF4ng t\xECm th\u1EA5y m\u1EADt kh\u1EA9u \u0111\xE3 m\xE3 h\xF3a");
    }
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) return errorResponse(res, 401, "Sai th\xF4ng tin \u0111\u0103ng nh\u1EADp");
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return errorResponse(res, 500, "JWT secret not defined");
    }
    const token = jwt.sign(
      { id: admin.get("_id"), username: admin.get("username") },
      JWT_SECRET,
      { expiresIn: "4h" }
    );
    return successResponse(res, token);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "L\u1ED7i \u0111\u0103ng nh\u1EADp");
  }
};
var AuthController = {
  login
};

// src/routes/auth.route.ts
var router2 = Router2();
router2.post("/login", AuthController.login);
var auth_route_default = router2;

// src/app.ts
import cors from "cors";

// src/middleware/authenticateToken.ts
import jwt2 from "jsonwebtoken";
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return errorResponse(res, 401, "Please login and try again.");
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    jwt2.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return errorResponse(res, 403, "You don't permission.");
  }
};

// src/app.ts
var app = express();
app.use(express.urlencoded({ extended: true }));
var corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", auth_route_default);
app.use("/api/students", authenticateToken, student_route_default);
var app_default = app;

// src/server.ts
import dotenv from "dotenv";

// src/config/db.ts
import mongoose4 from "mongoose";
var connectToDatabase = async () => {
  try {
    await mongoose4.connect(process.env.URL + "/" + process.env.DATABASE_NAME);
    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

// src/server.ts
import bcrypt2 from "bcryptjs";
import mongoose5 from "mongoose";
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
