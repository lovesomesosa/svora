"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import TrackCard from "@/components/projects/TrackCard";
import { useAuth } from "@/providers/AuthProvider";
import { getProjectById } from "@/lib/project-details";
import { createTrack } from "@/lib/tracks";
import { createVersion } from "@/lib/versions";
import { createComment } from "@/lib/comments";
import type { ProjectDetailsResponse } from "@/lib/types";

type VersionFormState = {
  versionName: string;
  fileUrl: string;
};

type CommentFormState = {
  text: string;
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [project, setProject] = useState<ProjectDetailsResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trackTitle, setTrackTitle] = useState("");
  const [trackOrder, setTrackOrder] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  // State для управления открытием форм и данными форм для каждой версии и комментария(вынесены на уровень страницы, чтобы сохранять их состояние при открытии/закрытии форм и обновлении данных трека)
  const [openVersionForms, setOpenVersionForms] = useState<
    Record<string, boolean>
  >({});
  const [openCommentForms, setOpenCommentForms] = useState<
    Record<string, boolean>
  >({});

  const [versionForms, setVersionForms] = useState<
    Record<string, VersionFormState>
  >({});
  const [commentForms, setCommentForms] = useState<
    Record<string, CommentFormState>
  >({});
  const [versionLoadingMap, setVersionLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [commentLoadingMap, setCommentLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [versionErrorMap, setVersionErrorMap] = useState<
    Record<string, string>
  >({});
  const [commentErrorMap, setCommentErrorMap] = useState<
    Record<string, string>
  >({});

  const loadProject = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getProjectById(token, id as string);
      setProject(data);

      const initialVersionForms: Record<string, VersionFormState> = {};
      const initialCommentForms: Record<string, CommentFormState> = {};

      data.tracks.forEach((track) => {
        initialVersionForms[track.id] = { versionName: "", fileUrl: "" };
        initialCommentForms[track.id] = { text: "" };
      });

      setVersionForms(initialVersionForms);
      setCommentForms(initialCommentForms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  async function handleCreateTrack() {
    if (!trackTitle.trim() || !token || !id || !project) {
      return;
    }

    setTrackError("");

    if (project.type === "ALBUM") {
      if (!trackOrder.trim()) {
        setTrackError("Для альбома нужно указать номер трека");
        return;
      }

      const parsedOrder = Number(trackOrder);

      if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
        setTrackError("Номер трека должен быть целым числом больше 0");
        return;
      }
    }

    const payload =
      project.type === "ALBUM"
        ? {
            title: trackTitle.trim(),
            order: Number(trackOrder),
          }
        : {
            title: trackTitle.trim(),
          };

    try {
      setTrackLoading(true);
      await createTrack(token, id as string, payload);
      setTrackTitle("");
      setTrackOrder("");
      await loadProject();
    } catch (err) {
      setTrackError(
        err instanceof Error ? err.message : "Failed to create track"
      );
    } finally {
      setTrackLoading(false);
    }
  }

  // Функции для управления открытием форм и данными форм для каждой версии и комментария
  function toggleVersionForm(trackId: string) {
    setOpenVersionForms((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  }
  function toggleCommentForm(trackId: string) {
    setOpenCommentForms((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  }

  function updateVersionForm(
    trackId: string,
    patch: Partial<VersionFormState>
  ) {
    setVersionForms((prev) => ({
      ...prev,
      [trackId]: {
        ...(prev[trackId] || { versionName: "", fileUrl: "" }),
        ...patch,
      },
    }));
  }

  function updateCommentForm(
    trackId: string,
    patch: Partial<CommentFormState>
  ) {
    setCommentForms((prev) => ({
      ...prev,
      [trackId]: {
        ...(prev[trackId] || { text: "" }),
        ...patch,
      },
    }));
  }

  async function handleCreateVersion(trackId: string) {
    const form = versionForms[trackId];

    if (!token || !form) {
      return;
    }

    const versionName = form.versionName.trim();
    const fileUrl = form.fileUrl.trim();

    setVersionErrorMap((prev) => ({
      ...prev,
      [trackId]: "",
    }));

    if (!versionName || !fileUrl) {
      setVersionErrorMap((prev) => ({
        ...prev,
        [trackId]: "Заполни название версии и ссылку на файл",
      }));
      return;
    }

    try {
      setVersionLoadingMap((prev) => ({
        ...prev,
        [trackId]: true,
      }));

      await createVersion(token, trackId, versionName, fileUrl);

      setOpenVersionForms((prev) => ({
        ...prev,
        [trackId]: false,
      }));

      setVersionForms((prev) => ({
        ...prev,
        [trackId]: {
          versionName: "",
          fileUrl: "",
        },
      }));

      await loadProject();
    } catch (err) {
      setVersionErrorMap((prev) => ({
        ...prev,
        [trackId]:
          err instanceof Error ? err.message : "Failed to create version",
      }));
    } finally {
      setVersionLoadingMap((prev) => ({
        ...prev,
        [trackId]: false,
      }));
    }
  }

  async function handleCreateComment(trackId: string) {
    const form = commentForms[trackId];

    if (!token || !form) {
      return;
    }

    const text = form.text.trim();

    setCommentErrorMap((prev) => ({
      ...prev,
      [trackId]: "",
    }));

    if (!text) {
      setCommentErrorMap((prev) => ({
        ...prev,
        [trackId]: "Введите текст комментария",
      }));
      return;
    }

    try {
      setCommentLoadingMap((prev) => ({
        ...prev,
        [trackId]: true,
      }));

      await createComment(token, trackId, text);

      setOpenCommentForms((prev) => ({
        ...prev,
        [trackId]: false,
      }));

      setCommentForms((prev) => ({
        ...prev,
        [trackId]: {
          text: "",
        },
      }));

      await loadProject();
    } catch (err) {
      setCommentErrorMap((prev) => ({
        ...prev,
        [trackId]:
          err instanceof Error ? err.message : "Failed to create comment",
      }));
    } finally {
      setCommentLoadingMap((prev) => ({
        ...prev,
        [trackId]: false,
      }));
    }
  }

  if (loading) {
    return (
      <Protected>
        <p className="text-neutral-400">Загрузка проекта...</p>
      </Protected>
    );
  }

  if (error || !project) {
    return (
      <Protected>
        <div className="rounded-2xl border border-red-900 bg-red-950/30 p-4 text-red-300">
          {error || "Project not found"}
        </div>
      </Protected>
    );
  }

  const canEdit = user?.role === "CLIENT" && user.userId === project.userId;

  return (
    <Protected>
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {project.type} • {project.status}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Created: {new Date(project.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>

        {canEdit ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <h2 className="text-lg font-medium">Добавить трек</h2>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Название трека"
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
              />

              {project.type === "ALBUM" ? (
                <input
                  type="number"
                  min="1"
                  value={trackOrder}
                  onChange={(e) => setTrackOrder(e.target.value)}
                  placeholder="Номер"
                  className="w-32 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                />
              ) : null}

              <button
                onClick={handleCreateTrack}
                disabled={trackLoading}
                className="rounded-xl bg-white px-5 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {trackLoading ? "Добавляем..." : "Add track"}
              </button>
            </div>

            {trackError ? (
              <p className="mt-3 text-sm text-red-400">{trackError}</p>
            ) : null}

            {project.type === "ALBUM" ? (
              <p className="mt-2 text-sm text-neutral-500">
                Для альбома укажи порядок трека.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-500">
            Для этой роли доступен только просмотр проекта.
          </div>
        )}

        {project.tracks.length > 0 ? (
          <div className="space-y-4">
            {project.tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                canEdit={canEdit}
                versionName={versionForms[track.id]?.versionName || ""}
                fileUrl={versionForms[track.id]?.fileUrl || ""}
                commentText={commentForms[track.id]?.text || ""}
                versionLoading={Boolean(versionLoadingMap[track.id])}
                commentLoading={Boolean(commentLoadingMap[track.id])}
                versionError={versionErrorMap[track.id] || ""}
                commentError={commentErrorMap[track.id] || ""}
                isVersionFormOpen={Boolean(openVersionForms[track.id])}
                isCommentFormOpen={Boolean(openCommentForms[track.id])}
                onToggleVersionForm={() => toggleVersionForm(track.id)}
                onToggleCommentForm={() => toggleCommentForm(track.id)}
                onVersionNameChange={(value) =>
                  updateVersionForm(track.id, { versionName: value })
                }
                onFileUrlChange={(value) =>
                  updateVersionForm(track.id, { fileUrl: value })
                }
                onCommentTextChange={(value) =>
                  updateCommentForm(track.id, { text: value })
                }
                onCreateVersion={() => handleCreateVersion(track.id)}
                onCreateComment={() => handleCreateComment(track.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-6 text-neutral-500">
            В этом проекте пока нет треков.
          </div>
        )}
      </div>
    </Protected>
  );
}
