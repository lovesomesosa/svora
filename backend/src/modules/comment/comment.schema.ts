import { z } from "zod";

export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(500, "Comment too long"),
  timestamp: z.string().optional(),
});