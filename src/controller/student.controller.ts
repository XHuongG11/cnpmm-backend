import mongoose from "mongoose";
import { Request, Response } from "express";
import Student from "../models/student.model.js";
import { errorResponse, successResponse } from "../utils/responseHelper.js";
import ExamSession from "../models/examSession.model.js";

const getAreasByDate = async (req: Request, res: Response) => {
  const date = req.params.date;

  try {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));

    const data = await ExamSession.aggregate([
      {
        $match: {
          examDate: {
            $gte: start,
            $lt: end,
          },
        },
      },
      {
        $group: {
          _id: "$area",
        },
      },
      { $project: { _id: 0, area: "$_id" } },
      { $sort: { area: 1 } },
    ]).exec();
    const areaList = data.map((item) => item.area);
    return successResponse(res, areaList);
  } catch (error) {
    return errorResponse(res, 500, "Error fetching students by date");
  }
};

const getShiftsByDateAndArea = async (req: Request, res: Response) => {
  try {
    const { date, area } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));

    const data = await ExamSession.aggregate([
      {
        $match: {
          examDate: {
            $gte: start,
            $lt: end,
          },
          area: area,
        },
      },
      {
        $group: {
          _id: "$shift",
          rooms: { $addToSet: "$room" },
        },
      },
      { $project: { _id: 0, shift: "$_id", rooms: 1 } },
      { $sort: { shift: 1 } },
    ]).exec();

    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, 500, "Error fetching shifts by date and area");
  }
};

const getStudentsInRoom = async (req: Request, res: Response) => {
  try {
    const { date, area, shift, room } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(new Date(start).setDate(start.getDate() + 1));

    const [data] = await Student.aggregate([
      // Nối dữ liệu từ bảng ExamSession
      {
        $lookup: {
          from: "examsessions",
          localField: "examParticipations",
          foreignField: "_id",
          as: "examParticipationsData",
        },
      },
      { $unwind: "$examParticipationsData" },
      {
        $match: {
          "examParticipationsData.examDate": { $gte: start, $lt: end },
          "examParticipationsData.area": area,
          "examParticipationsData.shift": shift,
          "examParticipationsData.room": room,
        },
      },
      {
        $facet: {
          students: [
            {
              $project: {
                _id: 0,
                mssv: "$studentId",
                currentInfo: "$currentInfo",
              },
            },
          ],
          subjectName: [
            {
              $group: {
                _id: null,
                examName: { $first: "$examParticipationsData.examName" },
              },
            },
          ],
          total: [{ $count: "totalStudent" }],
        },
      },
      {
        $project: {
          students: 1,
          subjectName: { $arrayElemAt: ["$subjectName.examName", 0] },
          total: { $arrayElemAt: ["$total.totalStudent", 0] },
        },
      },
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

const searchByFullName = async (req: Request, res: Response) => {
  try {
    const fullName = req.query.fullName === undefined ? "" : req.query.fullName;
    const result = await Student.find(
      {
        "currentInfo.fullName": { $regex: fullName, $options: "i" },
      },
      { currentInfo: 1, studentId: 1, _id: 0 }
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 500, "Error search by name");
  }
};
const searchByStudentID = async (req: Request, res: Response) => {
  try {
    const studentId =
      req.params.studentId === undefined ? "" : req.params.studentId;
    const result = await Student.findOne(
      { studentId: studentId },
      { currentInfo: 1, studentId: 1, _id: 0 }
    );
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, 500, "Error search by name");
  }
};
export const StudentController = {
  getAreasByDate,
  getShiftsByDateAndArea,
  getStudentsInRoom,
  searchByFullName,
  searchByStudentID,
};
