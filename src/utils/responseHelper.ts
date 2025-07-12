import { Response } from "express";

// Hàm trả response thành công
export function successResponse<T>(res: Response, data: T) {
  res.status(200).json({
    status: "success",
    data,
  });
}

// Hàm trả response lỗi
export function errorResponse(
  res: Response,
  statusCode = 400,
  message: String
) {
  res.status(statusCode).json({
    status: "error",
    message,
  });
}
