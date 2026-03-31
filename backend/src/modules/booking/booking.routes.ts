import { Router } from "express";
import {
  createBooking,
  getMyBookings,
} from "./booking.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getMyBookings);

export default router;