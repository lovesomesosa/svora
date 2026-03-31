import { Response } from "express";
import * as bookingService from "./booking.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

type BookingIdParams = {
  id: string;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingService.createBooking(
      req.user!.userId,
      req.body
    );

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Booking failed",
    });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingService.getMyBookings(
      req.user!.userId
    );

    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getAllBookings = async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch all bookings" });
  }
};

export const updateBookingStatus = async (req: AuthRequest<BookingIdParams>, res: Response) => {
  try {
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user!.userId,
      req.body,
    );

    res.json(booking);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update booking",
    });
  }
};