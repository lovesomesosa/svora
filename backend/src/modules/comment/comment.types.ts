import { z } from "zod";
import { createCommentSchema } from "./comment.schema.js";

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
