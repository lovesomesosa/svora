import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  getAvailableSlots,
} from "./booking.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getMyBookings);
router.get("/available", authMiddleware, getAvailableSlots);

router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllBookings);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("OWNER"),
  updateBookingStatus,
);

export default router;
