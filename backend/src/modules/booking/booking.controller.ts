import { Response } from "express";
import * as bookingService from "./booking.service.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";

type BookingIdParams = {
  id: string;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const booking = await bookingService.createBooking(
      req.user!.userId,
      parsed.data,
    );

    return success(res, booking, "Booking created", 201);
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Booking failed",
      400,
    );
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user!.userId);
    return success(res, bookings, "My bookings fetched");
  } catch {
    return failure(res, "Failed to fetch bookings", 500);
  }
};

export const getAllBookings = async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();
    return success(res, bookings, "All bookings fetched");
  } catch {
    return failure(res, "Failed to fetch all bookings", 500);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest<BookingIdParams>,
  res: Response,
) => {
  try {
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
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to update booking",
      400,
    );
  }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return failure(res, "Date is required", 400);
    }

    const result = await bookingService.getAvailableSlots(date);
    return success(res, result, "Available slots fetched");
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to fetch slots",
      400,
    );
  }
};