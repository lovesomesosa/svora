import { z } from "zod";

export const createTrackVersionSchema = z.object({
  versionName: z
    .string()
    .min(1, "versionName is required")
    .max(50, "versionName must be at most 50 characters"),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
});