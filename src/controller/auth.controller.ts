import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";
import { errorResponse, successResponse } from "../utils/responseHelper";

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username });
    if (!admin) return errorResponse(res, 401, "Sai thông tin đăng nhập");

    const hashedPassword = admin.get("password");
    if (!hashedPassword || typeof hashedPassword !== "string") {
      return errorResponse(res, 500, "Không tìm thấy mật khẩu đã mã hóa");
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) return errorResponse(res, 401, "Sai thông tin đăng nhập");

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
    return errorResponse(res, 500, "Lỗi đăng nhập");
  }
};

export const AuthController = {
  login,
};
