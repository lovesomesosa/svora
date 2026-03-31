import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const me = (req: AuthRequest, res: Response) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
};
