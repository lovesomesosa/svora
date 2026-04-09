import { Router } from "express";
import { getPublicAvailableSlots } from "./booking.public.controller.js";

const router = Router();

router.get("/bookings/available", getPublicAvailableSlots);

export default router;