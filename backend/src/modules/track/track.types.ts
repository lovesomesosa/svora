import { z } from "zod";
import { createTrackSchema } from "./track.schema.js";

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
