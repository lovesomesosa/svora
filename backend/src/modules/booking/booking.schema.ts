// ВАЛИДАЦИЯ ДАННЫХ ДЛЯ БРОНИРОВАНИЯ

import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createBookingSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().regex(timeRegex, "startTime must be in HH:mm format"),
    endTime: z.string().regex(timeRegex, "endTime must be in HH:mm format"),
    serviceType: z.enum(["RECORDING", "MIXING", "MASTERING"], {
      message: "Invalid serviceType",
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"], {
    message: "Invalid status",
  }),
});
