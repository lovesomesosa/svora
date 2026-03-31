import { prisma } from "../../lib/prisma.js";
import { CreateBookingInput } from "./booking.types.js";
import { UpdateBookingStatusInput } from "./booking.types.js";

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

// for owners
export const getAllBookings = async () => {
  return prisma.booking.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assigned: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

// for owners to confirm or cancel bookings
export const updateBookingStatus = async (
  bookingId: string,
  ownerId: string,
  data: UpdateBookingStatusInput,
) => {
  const { status } = data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      assignedTo: ownerId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assigned: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};