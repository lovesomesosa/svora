import { Response } from "express";
import * as bookingService from "./booking.service.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

import { failure, success } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type BookingIdParams = {
  id: string;
};

export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const parsed = createBookingSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const booking = await bookingService.createBooking(
      req.user!.userId,
      parsed.data,
    );

    return success(res, booking, "Booking created", 201);
  },
);

export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const bookings = await bookingService.getMyBookings(req.user!.userId);
    return success(res, bookings, "My bookings fetched");
  },
);

export const getAllBookings = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const bookings = await bookingService.getAllBookings();
    return success(res, bookings, "All bookings fetched");
  },
);

export const updateBookingStatus = asyncHandler(
  async (req: AuthRequest<BookingIdParams>, res: Response) => {
    const parsed = updateBookingStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user!.userId,
      parsed.data,
    );

    return success(res, booking, "Booking status updated");
  },
);

export const getAvailableSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return failure(res, "Date is required", 400);
    }

    const result = await bookingService.getAvailableSlots(date);
    return success(res, result, "Available slots fetched");
  },
);
