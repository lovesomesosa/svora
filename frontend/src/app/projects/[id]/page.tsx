"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import { getProjectById } from "@/lib/project-details";
import { createTrack } from "@/lib/tracks";
import { createVersion } from "@/lib/versions";
import { createComment } from "@/lib/comments";
import type { ProjectDetailsResponse, Track } from "@/lib/types";

type VersionFormState = {
  versionName: string;
  fileUrl: string;
};

type CommentFormState = {
  text: string;
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [project, setProject] =
    useState<ProjectDetailsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trackTitle, setTrackTitle] = useState("");
  const [trackOrder, setTrackOrder] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

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
  const [versionErrorMap, setVersionErrorMap] = useState<Record<string, string>>(
    {},
  );
  const [commentErrorMap, setCommentErrorMap] = useState<Record<string, string>>(
    {},
  );
  const [openVersionForms, setOpenVersionForms] = useState<
  Record<string, boolean>
  >({});
  const [openCommentForms, setOpenCommentForms] = useState<
  Record<string, boolean>
  >({});

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
      setTrackError(err instanceof Error ? err.message : "Failed to create track");
    } finally {
      setTrackLoading(false);
    }
  }

  function updateVersionForm(
    trackId: string,
    patch: Partial<VersionFormState>,
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
    patch: Partial<CommentFormState>,
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

  return (
    <Protected>
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {project.type} • {project.status}
          </p>
        </div>

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

        <div className="space-y-4">
          {project.tracks.map((track: Track) => (
            <div
              key={track.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <h2 className="text-xl font-medium">
                {track.order ? `${track.order}. ` : ""}
                {track.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
  <button
    onClick={() => toggleVersionForm(track.id)}
    className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
  >
    {openVersionForms[track.id] ? "Hide version form" : "Add version"}
  </button>

  <button
    onClick={() => toggleCommentForm(track.id)}
    className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
  >
    {openCommentForms[track.id] ? "Hide comment form" : "Add comment"}
  </button>
</div>

{openVersionForms[track.id] ? (
  <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
    <p className="text-sm font-medium text-neutral-300">Add version</p>

    <div className="mt-3 space-y-3">
      <input
        value={versionForms[track.id]?.versionName || ""}
        onChange={(e) =>
          updateVersionForm(track.id, {
            versionName: e.target.value,
          })
        }
        placeholder="Version name"
        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
      />

      <input
        value={versionForms[track.id]?.fileUrl || ""}
        onChange={(e) =>
          updateVersionForm(track.id, {
            fileUrl: e.target.value,
          })
        }
        placeholder="File URL"
        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
      />

      {versionErrorMap[track.id] ? (
        <p className="text-sm text-red-400">{versionErrorMap[track.id]}</p>
      ) : null}

      <button
        onClick={() => handleCreateVersion(track.id)}
        disabled={versionLoadingMap[track.id]}
        className="rounded-xl bg-white px-4 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {versionLoadingMap[track.id] ? "Добавляем..." : "Save version"}
      </button>
    </div>
  </div>
) : null}

{openCommentForms[track.id] ? (
  <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
    <p className="text-sm font-medium text-neutral-300">Add comment</p>

    <div className="mt-3 space-y-3">
      <textarea
        value={commentForms[track.id]?.text || ""}
        onChange={(e) =>
          updateCommentForm(track.id, {
            text: e.target.value,
          })
        }
        placeholder="Comment text"
        className="min-h-[110px] w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
      />

      {commentErrorMap[track.id] ? (
        <p className="text-sm text-red-400">{commentErrorMap[track.id]}</p>
      ) : null}

      <button
        onClick={() => handleCreateComment(track.id)}
        disabled={commentLoadingMap[track.id]}
        className="rounded-xl bg-white px-4 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {commentLoadingMap[track.id] ? "Добавляем..." : "Save comment"}
      </button>
    </div>
  </div>
) : null}

              <div className="mt-5 space-y-2">
                <p className="text-sm font-medium text-neutral-300">Versions</p>

                {track.versions && track.versions.length > 0 ? (
                  <div className="space-y-2">
                    {track.versions.map((v) => (
                      <div
                        key={v.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-400"
                      >
                        <p className="font-medium text-neutral-200">
                          🎵 {v.versionName}
                        </p>
                        <a
                          href={v.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block break-all text-xs text-blue-400"
                        >
                          {v.fileUrl}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No versions</p>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-sm font-medium text-neutral-300">Comments</p>

                {track.comments && track.comments.length > 0 ? (
                  <div className="space-y-2">
                    {track.comments.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-500"
                      >
                        <p>{c.text}</p>
                        {c.user ? (
                          <p className="mt-1 text-xs text-neutral-600">
                            {c.user.name} • {c.user.role}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No comments</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Protected>
  );
}