import mongoose from "mongoose";
import { Request, Response } from "express";
import { Student } from "../models/student.model.js"; // Adjust the import path as necessary
import { errorResponse, successResponse } from "../utils/responseHelper.js";

const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find();
    return successResponse(res, students);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error fetching students",
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const StudentController = {
  getAllStudents,
};
