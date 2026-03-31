import { z } from "zod";

export const createTrackSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  order: z
    .number()
    .int("Order must be an integer")
    .positive("Order must be greater than 0")
    .optional(),
});