import { Response } from "express";

export const success = <T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const failure = (
  res: Response,
  message: string,
  statusCode = 400,
  details?: unknown,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};