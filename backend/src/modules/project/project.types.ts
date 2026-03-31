import { z } from "zod";
import { createProjectSchema } from "./project.schema.js";

export type CreateProjectInput = z.infer<typeof createProjectSchema>;