// СХЕМА ВАЛИДАЦИИ ДАННЫХ ДЛЯ ПРОЕКТА(СИНГЛ/АЛЬБОМ)

import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  type: z.enum(["SINGLE", "ALBUM"], {
    message: "Invalid project type",
  }),
});

export const projectIdParamsSchema = z.object({
  id: z.string().min(1, "Project id is required"),
});
