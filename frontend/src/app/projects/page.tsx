"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import { createProject, getAllProjects, getProjects } from "@/lib/projects";
import type { CreateProjectPayload, Project, ProjectType } from "@/lib/types";

const projectTypes: ProjectType[] = ["SINGLE", "ALBUM"];

export default function ProjectsPage() {
  const { token, user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<CreateProjectPayload>({
    title: "",
    type: "SINGLE",
  });

  async function loadProjects() {
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
  }

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
        err instanceof Error ? err.message : "Не удалось создать проект",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      void loadProjects();
    }
  }, [token, user, authLoading]);

  return (
    <Protected>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-2 text-neutral-400">
            {user?.role === "OWNER"
              ? "Все проекты студии"
              : "Твои музыкальные проекты"}
          </p>
        </div>

        {user?.role === "CLIENT" ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
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

        {loading ? (
          <p className="text-neutral-400">Загрузка проектов...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">
            Проектов пока нет.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-medium">{project.title}</h2>
                    <p className="mt-2 text-sm text-neutral-400">
                      {project.type} • {project.status}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      userId: {project.userId}
                    </p>
                    {(project as any).user ? (
                        <p className="mt-2 text-xs text-neutral-500">
                            Автор: {(project as any).user.name}
                            </p>) : null}
                  </div>

                  <span className="text-xs text-neutral-500">
                    {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Protected>
  );
}