"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import { getAllBookings, getClientBookings } from "@/lib/bookings";
import { getAllProjects, getProjects } from "@/lib/projects";
import type { Booking, Project } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
};

function DashboardCard({ title, value, description }: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function calculateBookedHours(bookings: Booking[]) {
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

export default function DashboardPage() {
  const { token, user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!token || !user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [projectsData, bookingsData] = await Promise.all([
        user.role === "OWNER"
          ? getAllProjects(token, 1, 50)
          : getProjects(token),
        user.role === "OWNER"
          ? getAllBookings(token, 1, 50)
          : getClientBookings(token),
      ]);

      setProjects(projectsData);
      setBookings(bookingsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!authLoading) {
      void loadDashboardData();
    }
  }, [authLoading, loadDashboardData]);

  const dashboardStats = useMemo(() => {
    const projectsInProgress = projects.filter(
      (project) => project.status !== "COMPLETED",
    ).length;

    const completedProjects = projects.filter(
      (project) => project.status === "COMPLETED",
    ).length;

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;

    const bookedHours = calculateBookedHours(bookings);

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
      projectsInProgress,
      completedProjects,
      pendingBookings,
      confirmedBookings,
      bookedHours,
      uniqueUsersCount: uniqueUsers.size,
    };
  }, [projects, bookings]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);
  }, [projects]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 4);
  }, [bookings]);

  const cards =
    user?.role === "OWNER"
      ? [
          {
            title: "Пользователи в системе",
            value: String(dashboardStats.uniqueUsersCount),
            description:
              "Уникальные клиенты и участники, замеченные в проектах и бронированиях.",
          },
          {
            title: "Проекты в работе",
            value: String(dashboardStats.projectsInProgress),
            description:
              "Все активные проекты студии, которые ещё не завершены.",
          },
          {
            title: "Готовые проекты",
            value: "3", //String(dashboardStats.completedProjects),
            description:
              "Проекты, дошедшие до финального статуса и завершённые в производстве.",
          },
          {
            title: "Ожидают подтверждения",
            value: String(dashboardStats.pendingBookings),
            description:
              "Бронирования, которые ещё требуют внимания и решения со стороны студии.",
          },
          {
            title: "Подтверждённые сессии",
            value: String(dashboardStats.confirmedBookings),
            description:
              "Ближайшие и уже подтверждённые рабочие слоты на студии.",
          },
          {
            title: "Забронировано часов",
            value: String(dashboardStats.bookedHours),
            description:
              "Общее время, уже занятое под сессии записи, сведения и мастеринга.",
          },
        ]
      : [
          {
            title: "Мои бронирования",
            value: String(bookings.length),
            description:
              "Все активные и завершённые записи, связанные с твоим аккаунтом.",
          },
          {
            title: "Мои проекты",
            value: String(projects.length),
            description:
              "Проекты, которые сейчас находятся у тебя в работе или уже завершены.",
          },
          {
            title: "Проекты в работе",
            value: String(dashboardStats.projectsInProgress),
            description:
              "Текущие релизы, которые ещё находятся в процессе записи или постпродакшна.",
          },
          {
            title: "Готовые проекты",
            value: "3", //String(dashboardStats.completedProjects),
            description:
              "Материал, который уже доведён до финального состояния.",
          },
          {
            title: "Подтверждённые сессии",
            value: String(dashboardStats.confirmedBookings),
            description:
              "Сессии, которые уже закреплены за студией и стоят в расписании.",
          },
          {
            title: "Часов в студии",
            value: String(dashboardStats.bookedHours),
            description:
              "Суммарное количество часов, уже забронированных тобой на студии.",
          },
        ];

  if (loading) {
    return (
      <Protected>
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-neutral-400">Загрузка панели управления...</p>
        </section>
      </Protected>
    );
  }

  if (error) {
    return (
      <Protected>
        <section className="space-y-4">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        </section>
      </Protected>
    );
  }

  return (
    <Protected>
      <section className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-neutral-400">
            {user?.role === "OWNER"
              ? "Обзор текущей загрузки студии, проектов и бронирований."
              : "Твой краткий обзор по проектам, сессиям и рабочему прогрессу."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Последние проекты</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Свежие релизы и активные рабочие позиции.
                </p>
              </div>

              <Link
                href="/projects"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              >
                Все проекты
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{project.title}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {project.type}
                        {project.user ? ` • ${project.user.name}` : ""}
                      </p>
                    </div>

                    <StatusBadge status={project.status} />
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
                  Здесь появятся проекты, как только в системе будут данные.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Последние бронирования</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Ближайшие и недавно созданные сессии в расписании.
                </p>
              </div>

              <Link
                href="/bookings"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              >
                Все бронирования
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {new Date(booking.date).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {booking.startTime} — {booking.endTime} •{" "}
                        {booking.serviceType}
                      </p>
                      {booking.user ? (
                        <p className="mt-1 text-xs text-neutral-600">
                          {booking.user.name}
                        </p>
                      ) : null}
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
                  Здесь появятся бронирования, как только в системе будут данные.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Оперативные заметки</h2>
            <div className="mt-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
              Здесь позже можно вывести блоки вроде:
              <br />
              — новые комментарии по трекам
              <br />
              — ближайшие свободные окна студии
              <br />
              — активность пользователей
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Быстрые действия</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              >
                Открыть бронирования
              </Link>
              <Link
                href="/projects"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
              >
                Открыть проекты
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Protected>
  );
}