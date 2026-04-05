import { apiRequest } from "@/lib/api";
import type {
  AvailableSlotsResponse,
  Booking,
  BookingStatus,
  BookingsResponse,
  CreateBookingPayload,
  CreateBookingResponse,
} from "@/lib/types";

function normalizeBookingsResponse(response: BookingsResponse): Booking[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.items;
}

export async function getClientBookings(token: string): Promise<Booking[]> {
  const response = await apiRequest<BookingsResponse>("/api/bookings", {
    method: "GET",
    token,
  });

  return normalizeBookingsResponse(response);
}

export async function createBooking(
  token: string,
  payload: CreateBookingPayload
) {
  return apiRequest<CreateBookingResponse>("/api/bookings", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function getAllBookings(
  token: string,
  page = 1,
  limit = 10
): Promise<Booking[]> {
  const response = await apiRequest<BookingsResponse>(
    `/api/bookings/all?page=${page}&limit=${limit}`,
    {
      method: "GET",
      token,
    }
  );

  return normalizeBookingsResponse(response);
}

export async function getAvailableSlots(token: string, date: string) {
  const response = await apiRequest<AvailableSlotsResponse>(
    `/api/bookings/available?date=${date}`,
    {
      method: "GET",
      token,
    }
  );

  return response.data.availableSlots;
}

export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: BookingStatus
) {
  return apiRequest(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
