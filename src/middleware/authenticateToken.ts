import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { errorResponse } from "../utils/responseHelper";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return errorResponse(res, 401, "Please login and try again.");

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    jwt.verify(token, JWT_SECRET) as JwtPayload;
    // req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 403, "You don't permission.");
  }
};
