import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";

import bookingRoutes from "../modules/booking/booking.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);

export default router;