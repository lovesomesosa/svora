import { Request, Response } from "express";

export const exampleHandler = (req: Request, res: Response) => {
  res.json({ message: "Example endpoint works!" });
};
