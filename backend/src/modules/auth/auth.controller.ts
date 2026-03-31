import { Request, Response } from "express";
import * as authService from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error: unknown) {
    console.error("REGISTER ERROR:", error);

    if (error instanceof Error) {
      res.status(400).json({
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
      return;
    }

    res.status(400).json({
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: unknown) {
    console.error("LOGIN ERROR:", error);

    if (error instanceof Error) {
      res.status(401).json({
        message: error.message,
        name: error.name,
      });
      return;
    }

    res.status(401).json({
      message: "Login failed",
    });
  }
};