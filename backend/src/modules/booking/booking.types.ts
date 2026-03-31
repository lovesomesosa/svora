import { z } from "zod";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
