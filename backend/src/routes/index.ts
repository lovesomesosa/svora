import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import bookingRoutes from "../modules/booking/booking.routes.js";
import projectRoutes from "../modules/project/project.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/projects", projectRoutes);

export default router;