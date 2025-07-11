import mongoose from "mongoose";
import { Request, Response } from "express";
import Student from "../models/student.model.js";
import { errorResponse, successResponse } from "../utils/responseHelper.js";

const getAreasByDate = async (req: Request, res: Response) => {
  const date = req.params.date;

  try {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }

    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` },
        },
      },
      {
        $group: {
          _id: "$examParticipations.area",
        },
      },
      { $project: { _id: 0, area: "$_id" } },
      { $sort: { area: 1 } },
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

const getShiftsByDateAndArea = async (req: Request, res: Response) => {
  try {
    const { date, area } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse(res, 400, "Invalid date format. Use YYYY-MM-DD.");
    }

    const data = await Student.aggregate([
      { $unwind: "$examParticipations" },
      {
        $match: {
          "examParticipations.examDate": { $regex: `^${date}` },
          "examParticipations.area": area,
        },
      },
      {
        $group: {
          _id: "$examParticipations.shift",
        },
      },
      { $project: { _id: 0, shift: "$_id" } },
      { $sort: { shift: 1 } },
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

const getRoomsByDateAreaAndShift = async (req: Request, res: Response) => {
  try {
    const { date, area, shift } = req.params;

    // Validate date format (YYYY-MM-DD)
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
        },
      },
      {
        $group: {
          _id: "$examParticipations.room",
        },
      },
      { $project: { _id: 0, room: "$_id" } },
      { $sort: { room: 1 } },
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

const getStudentsByDateAreaShiftAndRoom = async (
  req: Request,
  res: Response
) => {
  try {
    const { date, area, shift, room } = req.params;

    // Validate date format (YYYY-MM-DD)
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
          "examParticipations.room": room,
        },
      },
      { $project: { _id: 0, mssv: "$studentId", currentInfo: "$currentInfo" } },
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
export const StudentController = {
  getAreasByDate,
  getShiftsByDateAndArea,
  getRoomsByDateAreaAndShift,
  getStudentsByDateAreaShiftAndRoom,
};
