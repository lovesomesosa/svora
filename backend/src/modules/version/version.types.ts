import { z } from "zod";
import { createTrackVersionSchema } from "./version.schema.js";

export type CreateTrackVersionInput = z.infer<typeof createTrackVersionSchema>;