import { prisma } from "../../lib/prisma.js";
import { CreateBookingInput } from "./booking.types.js";

export const createBooking = async (
  userId: string,
  data: CreateBookingInput
) => {
  const { date, startTime, endTime, serviceType } = data;

  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }

  const bookingDate = new Date(date);

  // проверка пересечений
  const existing = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  if (existing) {
    throw new Error("Time slot is already booked");
  }

  return prisma.booking.create({
    data: {
      userId,
      date: bookingDate,
      startTime,
      endTime,
      serviceType,
    },
  });
};

export const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
};