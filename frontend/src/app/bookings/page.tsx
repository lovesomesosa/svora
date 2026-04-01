"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import {
  createBooking,
  getAllBookings,
  getAvailableSlots,
  getClientBookings,
  updateBookingStatus,
} from "@/lib/bookings";
import type {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  ServiceType,
} from "@/lib/types";

const serviceOptions: ServiceType[] = ["RECORDING", "MIXING", "MASTERING"];

export default function BookingsPage() {
  const { token, user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-03-31");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState<CreateBookingPayload>({
    date: "2026-03-31",
    startTime: "",
    endTime: "",
    serviceType: "RECORDING",
  });

  const availableEndTimes = useMemo(() => {
    if (!form.startTime) {
      return [];
    }

    return slots.filter((slot) => slot > form.startTime);
  }, [slots, form.startTime]);

  async function loadBookings() {
    if (!token || !user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        user.role === "OWNER"
          ? await getAllBookings(token, 1, 20)
          : await getClientBookings(token);

      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(date: string) {
    if (!token) {
      return;
    }

    try {
      setSlotsLoading(true);
      const data = await getAvailableSlots(token, date);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function handleStatusChange(
    bookingId: string,
    status: BookingStatus,
  ) {
    if (!token) {
      return;
    }

    try {
      await updateBookingStatus(token, bookingId, status);
      await loadBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setSubmitError("");

    if (!form.date || !form.startTime || !form.endTime || !form.serviceType) {
      setSubmitError("Заполни все поля бронирования");
      return;
    }

    if (form.startTime >= form.endTime) {
      setSubmitError("Время окончания должно быть позже времени начала");
      return;
    }

    try {
      setSubmitLoading(true);

      await createBooking(token, form);

      setForm((prev) => ({
        ...prev,
        startTime: "",
        endTime: "",
      }));

      await loadBookings();
      await loadSlots(form.date);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось создать бронирование",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      void loadBookings();
    }
  }, [token, user, authLoading]);

  useEffect(() => {
    void loadSlots(selectedDate);
  }, [selectedDate, token]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: selectedDate,
      startTime: "",
      endTime: "",
    }));
  }, [selectedDate]);

  return (
    <Protected>
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Bookings</h1>
          <p className="mt-2 text-neutral-400">
            {user?.role === "OWNER"
              ? "Все бронирования студии"
              : "Твои бронирования"}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-semibold">Свободные слоты</h2>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            />

            {slotsLoading ? (
              <p className="text-sm text-neutral-400">Загрузка слотов...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <span
                      key={slot}
                      className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-500">
                    Нет доступных слотов
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {user?.role === "CLIENT" ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-xl font-semibold">Создать бронирование</h2>

            <form
              onSubmit={handleCreateBooking}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                required
              />

              <select
                value={form.serviceType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceType: event.target.value as ServiceType,
                  }))
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>

              <select
                value={form.startTime}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    startTime: event.target.value,
                    endTime: "",
                  }))
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                required
              >
                <option value="">Выбери время начала</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <select
                value={form.endTime}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    endTime: event.target.value,
                  }))
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                required
              >
                <option value="">Выбери время окончания</option>
                {availableEndTimes.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2">
                {submitError ? (
                  <p className="mb-3 text-sm text-red-400">{submitError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded-xl bg-white px-5 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {submitLoading ? "Создаём..." : "Создать бронирование"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {loading ? (
          <p className="text-neutral-400">Загрузка бронирований...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">
            Бронирований пока нет.
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {new Date(booking.date).toLocaleDateString("ru-RU")}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {booking.startTime} — {booking.endTime}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Service: {booking.serviceType}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Status: {booking.status}
                    </p>

                    {booking.user ? (
                      <p className="text-sm text-neutral-400">
                        Клиент: {booking.user.name} ({booking.user.email})
                      </p>
                    ) : null}

                    {booking.assigned ? (
                      <p className="text-sm text-neutral-400">
                        Назначен: {booking.assigned.name}
                      </p>
                    ) : null}
                  </div>

                  {user?.role === "OWNER" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "CONFIRMED")
                        }
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, "CANCELLED")
                        }
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Protected>
  );
}