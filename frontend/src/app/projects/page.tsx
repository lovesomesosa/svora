"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import { createProject, getAllProjects, getProjects } from "@/lib/projects";
import type {
  CreateProjectPayload,
  Project,
  ProjectStatus,
  ProjectType,
} from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";

const projectTypes: ProjectType[] = ["SINGLE", "ALBUM"];
const projectStatuses: ProjectStatus[] = [
  "RECORDING",
  "MIXING",
  "MASTERING",
  "COMPLETED",
];

export default function ProjectsPage() {
  const { token, user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [typeFilter, setTypeFilter] = useState<"ALL" | ProjectType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProjectStatus>("ALL");

  const [form, setForm] = useState<CreateProjectPayload>({
    title: "",
    type: "SINGLE",
  });

  const loadProjects = useCallback(async () => {
    if (!token || !user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        user.role === "OWNER"
          ? await getAllProjects(token, 1, 20)
          : await getProjects(token);

      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setSubmitError("");

    if (!form.title.trim()) {
      setSubmitError("Укажи название проекта");
      return;
    }

    try {
      setSubmitLoading(true);

      await createProject(token, {
        title: form.title.trim(),
        type: form.type,
      });

      setForm({
        title: "",
        type: "SINGLE",
      });

      await loadProjects();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось создать проект"
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      void loadProjects();
    }
  }, [authLoading, loadProjects]);

  const filteredProjects = projects.filter((project) => {
  const matchesType = typeFilter === "ALL" || project.type === typeFilter;
  const matchesStatus =
    statusFilter === "ALL" || project.status === statusFilter;

  return matchesType && matchesStatus;
});

   const hasActiveFilters = typeFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <Protected>
      <section className="space-y-6">
        <div>
           <h1 className="text-3xl font-semibold">Projects</h1>

           {user?.role === "CLIENT" ? (
          <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-xl font-semibold">Создать проект</h2>

            <form
              onSubmit={handleCreateProject}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Название проекта"
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none"
                required
              />

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as ProjectType,
                  }))
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
                  {submitLoading ? "Создаём..." : "Создать проект"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

          <div className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="min-w-[180px]">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Type
                  </label>
                  <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as "ALL" | ProjectType)
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  >
                    <option value="ALL">All types</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
              </div>

      <div className="min-w-[200px]">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | ProjectStatus)
          }
          className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
        >
          <option value="ALL">All statuses</option>
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>

    {hasActiveFilters ? (
      <button
        type="button"
        onClick={() => {
          setTypeFilter("ALL");
          setStatusFilter("ALL");
        }}
        className="rounded-xl border border-neutral-700 px-4 py-3 text-sm text-neutral-300 transition hover:bg-neutral-800"
      >
        Reset filters
      </button>
    ) : null}
  </div>
</div>
          
          <p className="mt-2 text-neutral-400">
            {user?.role === "OWNER"
              ? "Все проекты студии"
              : "Твои музыкальные проекты"}
          </p>
        </div>


        {loading ? (
          <p className="text-neutral-400">Загрузка проектов...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">
            Ничего не найдено по выбранным фильтрам.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProjects.map((project) => (
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-medium transition group-hover:text-white">
                        {project.title}
                        </h2>
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
                          <span className="text-xs text-neutral-500">
                            {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                      </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Protected>
  );
}
