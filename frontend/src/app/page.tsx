"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { getAllBookings } from "@/lib/bookings";
import { getAllProjects } from "@/lib/projects";
import { apiRequest } from "@/lib/api";
import type { Booking, Project, UserRole } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { getPublicAvailableSlots } from "@/lib/bookings";

type MeResponse = {
  message: string;
  user: {
    userId: string;
    role: UserRole;
  };
};

type StudioMetricCardProps = {
  title: string;
  value: string;
  description: string;
};

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

function StudioMetricCard({
  title,
  value,
  description,
}: StudioMetricCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function calculateConfirmedHours(bookings: Booking[]) {
  return bookings.reduce((total, booking) => {
    if (booking.status !== "CONFIRMED") {
      return total;
    }

    const start = Number(booking.startTime.split(":")[0]);
    const end = Number(booking.endTime.split(":")[0]);

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return total;
    }

    return total + (end - start);
  }, 0);
}

export default function HomePage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicSelectedDate, setPublicSelectedDate] = useState(getTodayDate());
  const [publicSlots, setPublicSlots] = useState<string[]>([]);
  const [publicSlotsLoading, setPublicSlotsLoading] = useState(false);
  const [publicSlotsError, setPublicSlotsError] = useState("");
  const publicDates = useMemo(() => getUpcomingDates(7), []);
  
  
  useEffect(() => {
    async function loadStudioData() {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await apiRequest<MeResponse>("/api/auth/me", {
          method: "GET",
          token,
        });

        setRole(me.user.role);

        if (me.user.role === "OWNER") {
          const [projectsData, bookingsData] = await Promise.all([
            getAllProjects(token, 1, 50),
            getAllBookings(token, 1, 50),
          ]);

          setProjects(projectsData);
          setBookings(bookingsData);
        }
      } catch {
        // Публичная главная должна работать и без данных.
      } finally {
        setLoading(false);
      }
    }

    void loadStudioData();
  }, []);

  const stats = useMemo(() => {
    const projectsInProgress = projects.filter(
      (project) => project.status !== "COMPLETED",
    ).length;

    const completedProjects = projects.filter(
      (project) => project.status === "COMPLETED",
    ).length;

    const confirmedHours = calculateConfirmedHours(bookings);

    const uniqueUsers = new Set<string>();

    projects.forEach((project) => {
      if (project.userId) {
        uniqueUsers.add(project.userId);
      }

      if (project.user?.id) {
        uniqueUsers.add(project.user.id);
      }
    });

    bookings.forEach((booking) => {
      if (booking.userId) {
        uniqueUsers.add(booking.userId);
      }

      if (booking.user?.id) {
        uniqueUsers.add(booking.user.id);
      }
    });

    return {
      usersCount: uniqueUsers.size,
      projectsInProgress,
      completedProjects,
      confirmedHours,
    };
  }, [projects, bookings]);

  const loadPublicSlots = useCallback(async (date: string) => {
    try {
      setPublicSlotsLoading(true);
      setPublicSlotsError("");

      const availableSlots = await getPublicAvailableSlots(date);
        setPublicSlots(availableSlots);
      } catch {
        setPublicSlots([]);
        setPublicSlotsError(
        "Публичный просмотр слотов появится после включения открытого endpoint на backend.",
      );
    } finally {
      setPublicSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicSlots(publicSelectedDate);
  }, [publicSelectedDate, loadPublicSlots]);

  const publicCards =
    role === "OWNER"
      ? [
          {
            title: "Пользователей в системе",
            value: String(stats.usersCount),
            description:
              "Уникальные клиенты и участники, которые уже работают со студией.",
          },
          {
            title: "Проектов завершено",
            value: String(stats.completedProjects),
            description:
              "Материал, доведённый до финального результата и завершённый в производстве.",
          },
          {
            title: "Часов работы с клиентами",
            value: String(stats.confirmedHours),
            description:
              "Суммарное подтверждённое студийное время, уже отработанное с клиентами.",
          },
          {
            title: "Проектов в работе",
            value: String(stats.projectsInProgress),
            description:
              "Релизы и записи, которые прямо сейчас находятся в активной стадии производства.",
          },
        ]
      : [
          {
            title: "Пользователей в системе",
            value: loading ? "..." : "—",
            description:
              "Этот показатель станет публичным после добавления отдельного studio API.",
          },
          {
            title: "Проектов завершено",
            value: loading ? "..." : "—",
            description:
              "Позже здесь появится открытая статистика по завершённым студийным релизам.",
          },
          {
            title: "Часов работы с клиентами",
            value: loading ? "..." : "—",
            description:
              "После добавления публичной аналитики здесь будет виден общий объём студийной работы.",
          },
          {
            title: "Проектов в работе",
            value: loading ? "..." : "—",
            description:
              "Этот блок позже будет показывать общий активный пул проектов студии.",
          },
        ];

  const showcaseProjects = projects.slice(0, 4);

  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8 md:p-10">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs uppercase tracking-wide text-neutral-400">
            Studio Management Platform
          </span>

          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Svora Manager — цифровая среда для работы студии и клиентов
          </h1>

          <p className="max-w-2xl text-base text-neutral-400 md:text-lg">
            Управляй бронированиями, проектами, треками, версиями и обратной
            связью в одном пространстве. От первой записи до готового релиза.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Ключевые показатели студии</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Краткий обзор активности, завершённых релизов и рабочей загрузки.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {publicCards.map((card) => (
            <StudioMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Команда студии</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Здесь позже появится открытый блок с сотрудниками, ролями и
                специализацией.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4">
              <p className="font-medium">Sound Engineer</p>
              <p className="mt-2 text-sm text-neutral-500">
                Заглушка под карточку сотрудника и описание специализации.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4">
              <p className="font-medium">Studio Owner</p>
              <p className="mt-2 text-sm text-neutral-500">
                Заглушка под владельца студии, контакты и управленческую роль.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Published Tracks</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Будущая витрина готовых релизов, опубликованных клиентами студии.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-500">
            Здесь позже появится showcase со свежими опубликованными треками,
            обложками и возможностью прослушивания.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Текущие проекты студии</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Несколько актуальных релизов и активных рабочих проектов.
            </p>
          </div>

          <Link
            href="/projects"
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Открыть проекты
          </Link>
        </div>

        {role === "OWNER" && showcaseProjects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showcaseProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/30"
              >
                <img
                  src="/images/cover.png"
                  alt="cover"
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.05]"
                />

                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-medium transition group-hover:text-white">
                        {project.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
                        <span>{project.type}</span>
                        <StatusBadge status={project.status} />
                      </div>

                      {project.user ? (
                        <p className="mt-2 text-xs text-neutral-500">
                          Автор: {project.user.name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-6 text-neutral-500">
            Здесь будет витрина активных проектов студии. Пока для публичной
            главной используется заглушка или owner-only данные.
          </div>
        )}
      </div>

      <div className="space-y-4">
  <div>
    <h2 className="text-2xl font-semibold">Свободные слоты студии</h2>
    <p className="mt-1 text-sm text-neutral-500">
      Посмотри доступные часы заранее. Для бронирования понадобится вход в
      систему.
    </p>
  </div>

  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
    <div className="flex gap-2 overflow-x-auto pb-1">
      {publicDates.map((date) => {
        const isSelected = publicSelectedDate === date;

        return (
          <button
            key={date}
            type="button"
            onClick={() => setPublicSelectedDate(date)}
            className={`min-w-[90px] shrink-0 rounded-xl border px-3 py-2 text-left transition ${
              isSelected
                ? "border-green-400 bg-green-500/15"
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
          </button>
        );
      })}
    </div>

    <div className="mt-4">
      {publicSlotsLoading ? (
        <p className="text-sm text-neutral-400">Загрузка доступности...</p>
      ) : publicSlotsError ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
          {publicSlotsError}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {allDaySlots.map((slot) => {
              const isAvailable = publicSlots.includes(slot);

              return (
                <div
                  key={slot}
                  className={`rounded-lg border px-2 py-1.5 text-center text-xs ${
                    isAvailable
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-neutral-700 bg-neutral-800/60 text-neutral-400"
                  }`}
                >
                  {slot}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500/20 ring-1 ring-green-500/30" />
              <span>Свободно</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-neutral-700" />
              <span>Недоступно</span>
            </div>
          </div>
        </>
      )}
      <div className="max-w-2xl space-y-3">
          <h2 className="mt-4 text-2xl font-semibold">
            Готов начать новый проект со студией?
          </h2>
          <p className="text-sm text-neutral-500">
            Забронируй время, создай проект и веди весь процесс — от записи до
            финального релиза — в одной системе.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/bookings"
              className="rounded-xl bg-white px-5 py-3 font-medium !text-black transition hover:opacity-90"
            >
              Перейти к бронированию
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-neutral-700 px-5 py-3 text-sm text-neutral-200 transition hover:bg-neutral-800"
            >
              Открыть dashboard
            </Link>
          </div>
        </div>
    </div>
  </div>
</div>

    </section>
  );
}