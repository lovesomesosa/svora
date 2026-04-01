import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

type UserRole = "CLIENT" | "OWNER";

export const roleMiddleware = (allowedRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
};


