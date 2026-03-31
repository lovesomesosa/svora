import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
} from "./booking.types.js";

type SerializebleBooking = {
  id: string;
  userId: string;
  assignedTo?: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  serviceType: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigned?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

const normalizeDateOnly = (input: string) => {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid date", 400);
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateTime = (baseDate: Date, hhmm: string) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const value = new Date(baseDate);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const serializeBooking = (booking: SerializebleBooking) => ({
  id: booking.id,
  userId: booking.userId,
  assignedTo: booking.assignedTo,
  date: booking.date,
  startTime: booking.startTime,
  endTime: booking.endTime,
  serviceType: booking.serviceType,
  status: booking.status,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,

  ...(booking.user && { user: booking.user }),
  ...(booking.assigned && { assigned: booking.assigned }),
});

export const createBooking = async (
  userId: string,
  data: CreateBookingInput,
) => {
  const { date, startTime, endTime, serviceType } = data;

  const bookingDate = normalizeDateOnly(date);
  const now = new Date();

  const bookingStart = toDateTime(bookingDate, startTime);

  if (bookingStart <= now) {
    throw new AppError("Cannot create booking in the past", 400);
  }

  const existing = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (existing) {
    throw new AppError("Time slot is already booked", 409);
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      date: bookingDate,
      startTime,
      endTime,
      serviceType,
    },
  });

  return serializeBooking(booking);
};

export const getMyBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return bookings.map(serializeBooking);
};

export const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
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

  return bookings.map(serializeBooking);
};

export const updateBookingStatus = async (
  bookingId: string,
  ownerId: string,
  data: UpdateBookingStatusInput,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const updateData =
    data.status === "CONFIRMED"
      ? {
          status: data.status,
          assignedTo: ownerId,
        }
      : {
          status: data.status,
        };

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
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

  return serializeBooking(updated);
};

export const getAvailableSlots = async (date: string) => {
  const bookingDate = normalizeDateOnly(date);
  const now = new Date();

  if (bookingDate < new Date(now.setHours(0, 0, 0, 0))) {
    return {
      date,
      availableSlots: [],
    };
  }

  const bookings = await prisma.booking.findMany({
    where: {
      date: bookingDate,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
  });

  const slots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const busySlots = bookings.flatMap((booking) => {
    const start = parseInt(booking.startTime.split(":")[0], 10);
    const end = parseInt(booking.endTime.split(":")[0], 10);

    const result: string[] = [];
    for (let hour = start; hour < end; hour++) {
      result.push(`${hour.toString().padStart(2, "0")}:00`);
    }

    return result;
  });

  let availableSlots = slots.filter((slot) => !busySlots.includes(slot));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate.getTime() === today.getTime()) {
    const current = new Date();

    availableSlots = availableSlots.filter((slot) => {
      const slotDate = toDateTime(bookingDate, slot);
      return slotDate > current;
    });
  }

  return {
    date,
    availableSlots,
  };
};
