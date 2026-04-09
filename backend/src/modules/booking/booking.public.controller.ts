import { Request, Response } from "express";
import * as bookingService from "./booking.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { success, failure } from "../../utils/api-response.js";

export const getPublicAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return failure(res, "Date is required", 400);
    }

    const result = await bookingService.getAvailableSlots(date);

    return success(
      res,
      { availableSlots: result.availableSlots },
      "Available slots fetched",
    );
  },
);