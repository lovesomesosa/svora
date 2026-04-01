import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import bookingRoutes from "../modules/booking/booking.routes.js";
import projectRoutes from "../modules/project/project.routes.js";
import trackRoutes from "../modules/track/track.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";
import versionRoutes from "../modules/version/version.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/projects", projectRoutes);
router.use("/tracks", trackRoutes);
router.use("/comments", commentRoutes); // только owner all
router.use("/versions", versionRoutes); // только owner all

export default router;