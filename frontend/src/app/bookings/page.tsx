"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import {
  createBooking,
  getAllBookings,
  getAvailableSlots,
  getClientBookings,
  updateBookingStatus,
} from "@/lib/bookings";
import StatusBadge from "@/components/ui/StatusBadge";
import type {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  ServiceType,
} from "@/lib/types";

const serviceOptions: ServiceType[] = ["RECORDING", "MIXING", "MASTERING"];
const bookingStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
];



function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}
function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}
function getUpcomingDates(daysCount: number) {
  const today = new Date();

  return Array.from({ length: daysCount }, (_, index) =>
    formatDate(addDays(today, index)),
  );
}



const allDaySlots = Array.from({ length: 24 }, (_, index) =>
  `${String(index).padStart(2, "0")}:00`,
);

function getSlotIndex(slot: string) {
  return allDaySlots.indexOf(slot);
}

function getNextSlot(slot: string) {
  const index = getSlotIndex(slot);

  if (index === -1 || index === allDaySlots.length - 1) {
    return null;
  }

  return allDaySlots[index + 1];
}

export default function BookingsPage() {
  const { token, user, loading: authLoading } = useAuth();

  const [dayAvailability, setDayAvailability] = useState<Record<string, number>>(
    {},
  );
  
  const upcomingDates = useMemo(() => getUpcomingDates(11), []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");

  const [form, setForm] = useState<CreateBookingPayload>({
    date: getTodayDate(),
    startTime: "",
    endTime: "",
    serviceType: "RECORDING",
  });

  const loadBookings = useCallback(async () => {
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
  }, [token, user]);

  const loadSlots = useCallback(
    async (date: string) => {
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
    },
    [token],
  );

  const loadUpcomingAvailability = useCallback(async () => {
  if (!token) {
    return;
  }

  try {
    const results = await Promise.all(
      upcomingDates.map(async (date) => {
        try {
          const available = await getAvailableSlots(token, date);
          return [date, available.length] as const;
        } catch {
          return [date, 0] as const;
        }
      }),
    );

    setDayAvailability(Object.fromEntries(results));
  } catch {
    setDayAvailability({});
  }
}, [token, upcomingDates]);

  async function handleStatusChange(bookingId: string, status: BookingStatus) {
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

  function resetTimeSelection(date: string) {
    setForm((prev) => ({
      ...prev,
      date,
      startTime: "",
      endTime: "",
    }));
    setSubmitError("");
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    resetTimeSelection(date);
  }

  function handleSlotClick(slot: string) {
    const isAvailable = slots.includes(slot);

    if (!isAvailable) {
      return;
    }

    const { startTime, endTime } = form;

    if (!startTime || (startTime && endTime)) {
      setForm((prev) => ({
        ...prev,
        date: selectedDate,
        startTime: slot,
        endTime: "",
      }));
      setSubmitError("");
      return;
    }

    if (slot === startTime) {
      setForm((prev) => ({
        ...prev,
        endTime: "",
      }));
      return;
    }

    const startIndex = getSlotIndex(startTime);
    const clickedIndex = getSlotIndex(slot);

    if (clickedIndex < startIndex) {
      setForm((prev) => ({
        ...prev,
        startTime: slot,
        endTime: "",
      }));
      return;
    }

    const range = allDaySlots.slice(startIndex, clickedIndex + 1);
    const isRangeFullyAvailable = range.every((rangeSlot) =>
      slots.includes(rangeSlot),
    );

    if (!isRangeFullyAvailable) {
      setSubmitError("Нельзя выбрать диапазон с занятыми часами");
      return;
    }

    const nextSlot = getNextSlot(slot);

    if (!nextSlot) {
      setSubmitError("Нельзя завершить бронирование в конце суток");
      return;
    }

    setForm((prev) => ({
      ...prev,
      endTime: nextSlot,
    }));
    setSubmitError("");
  }

  async function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setSubmitError("");

    if (!form.date || !form.startTime || !form.endTime || !form.serviceType) {
      setSubmitError("Выбери дату, услугу и диапазон времени");
      return;
    }

    if (form.startTime >= form.endTime) {
      setSubmitError("Время окончания должно быть позже времени начала");
      return;
    }

    try {
      setSubmitLoading(true);

      await createBooking(token, form);

      resetTimeSelection(form.date);
      await loadBookings();
      await loadSlots(form.date);
      await loadUpcomingAvailability();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось создать бронирование",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    void loadUpcomingAvailability();
  }, [loadUpcomingAvailability]);

  useEffect(() => {
    if (!authLoading) {
      void loadBookings();
    }
  }, [authLoading, loadBookings]);

  useEffect(() => {
    void loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const filteredBookings = bookings.filter((booking) => {
    return statusFilter === "ALL" || booking.status === statusFilter;
  });

  const hasActiveFilters = statusFilter !== "ALL";

  const selectedRange = useMemo(() => {
    if (!form.startTime || !form.endTime) {
      return [];
    }

    const startIndex = getSlotIndex(form.startTime);
    const endExclusiveIndex = getSlotIndex(form.endTime);

    if (startIndex === -1 || endExclusiveIndex === -1) {
      return [];
    }

    return allDaySlots.slice(startIndex, endExclusiveIndex);
  }, [form.startTime, form.endTime]);

  const bookingDurationHours = useMemo(() => {
  if (!form.startTime || !form.endTime) {
    return 0;
  }

  const startIndex = getSlotIndex(form.startTime);
  const endIndex = getSlotIndex(form.endTime);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return 0;
  }

  return endIndex - startIndex;
}, [form.startTime, form.endTime]);

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

  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-medium text-neutral-300">
      Ближайшие даты
    </h2>
  </div>

  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
    {upcomingDates.map((date) => {
      const availableCount = dayAvailability[date] ?? 0;
      const isSelected = selectedDate === date;
      const hasAvailability = availableCount > 0;

      return (
        <button
          key={date}
          onClick={() => handleDateChange(date)}
          className={`min-w-[90px] shrink-0 rounded-xl border px-3 py-2 text-left transition ${
            isSelected
              ? "border-green-400 bg-green-500/15"
              : hasAvailability
                ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
          }`}
        >
          <p className="text-[10px] uppercase text-neutral-500">
            {new Date(date).toLocaleDateString("ru-RU", {
              weekday: "short",
            })}
          </p>

          <p className="text-sm font-medium">
            {new Date(date).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>

          <p
            className={`text-[10px] ${
              hasAvailability ? "text-green-300" : "text-neutral-500"
            }`}
          >
            {availableCount > 0 ? `${availableCount}` : "—"}
          </p>
        </button>
      );
    })}
  </div>
</div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold">Доступность</h2>

          <div className="mt-4 space-y-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => handleDateChange(event.target.value)}
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            />

            {slotsLoading ? (
              <p className="text-sm text-neutral-400">Загрузка слотов...</p>
            ) : (
              
              <div className="space-y-4">
                <p className="text-sm font-medium text-neutral-300">
                  Доступность на {selectedDate}
                </p>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                  {allDaySlots.map((slot) => {
                    const isAvailable = slots.includes(slot);
                    const isSelectedStart = form.startTime === slot;
                    const isInsideSelectedRange = selectedRange.includes(slot);
                    const isSelectedEnd = form.endTime && getNextSlot(slot) === form.endTime;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        disabled={!isAvailable}
                        className={`rounded-lg border px-2 py-1.5 text-xs transition ${
                          isSelectedStart
                          ? "border-green-300 bg-green-400/30 text-white ring-1 ring-green-300/40"
                          : isSelectedEnd
                          ? "border-green-300 bg-green-400/25 text-white ring-1 ring-green-300/30"
                          : isInsideSelectedRange
                          ? "border-green-500/30 bg-green-500/15 text-green-200"
                          : isAvailable
                          ? "border-green-500/20 bg-green-500/5 text-green-300 hover:bg-green-500/10"
                          : "cursor-not-allowed border-neutral-700 bg-neutral-800/60 text-neutral-400"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500/20 ring-1 ring-green-500/30" />
                    <span>Свободно</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500/30 ring-1 ring-green-400/40" />
                    <span>Выбрано</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-neutral-700" />
                    <span>Недоступно / не выдано API</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {user?.role === "CLIENT" ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-xl font-semibold">Создать бронирование</h2>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => handleDateChange(event.target.value)}
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
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm text-neutral-300">
                  Выбранная дата:{" "}
                  <span className="font-medium text-white">{form.date}</span>
                </p>

                <p className="mt-2 text-sm text-neutral-300">
                  Начало:{" "}
                  <span className="font-medium text-white">
                    {form.startTime || "не выбрано"}
                  </span>
                </p>

                <p className="mt-1 text-sm text-neutral-300">
                  Конец:{" "}
                  <span className="font-medium text-white">
                    {form.endTime || "не выбрано"}
                  </span>
                  {bookingDurationHours > 0 ? (
                    <p className="mt-1 text-sm text-neutral-300">
                      Длительность:{" "}
                      <span className="font-medium text-white">
                        {bookingDurationHours - 1} ч.
                        {/* Фактическое бронирование на час меньше, так как конечный слот — это время окончания, а не последний занятый час */}
                      </span>
                    </p>
                      ) : null}
                </p>
                
                <p className="mt-3 text-xs text-neutral-500">Первый клик выбирает начало, второй — конец диапазона.
                  Можно выбрать только свободные часы подряд.
                  </p>
              </div>

              {submitError ? (
                <p className="text-sm text-red-400">{submitError}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitLoading}
                className="rounded-xl bg-white px-5 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {submitLoading ? "Создаём..." : "Создать бронирование"}
              </button>
            </form>
          </div>
        ) : null}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-[200px]">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                Filter (STATUS)
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "ALL" | BookingStatus)
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm"
              >
                <option value="ALL">All statuses</option>
                {bookingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="rounded-xl border border-neutral-700 px-4 py-3 text-sm text-neutral-300 transition hover:bg-neutral-800"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-400">Загрузка бронирований...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">
            {hasActiveFilters
              ? "Ничего не найдено по выбранным фильтрам."
              : "Бронирований пока нет."}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
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
                    <div className="pt-1">
                      <StatusBadge status={booking.status} />
                    </div>

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