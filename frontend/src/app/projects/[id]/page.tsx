"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/providers/AuthProvider";
import { getProjectById } from "@/lib/project-details";
import { createTrack } from "@/lib/tracks";
import { createVersion } from "@/lib/versions";
import { createComment } from "@/lib/comments";
import type { Track } from "@/lib/types";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [trackTitle, setTrackTitle] = useState("");
  const [trackOrder, setTrackOrder] = useState("");
  async function loadProject() {
    if (!token || !id) return;

    const data = await getProjectById(token, id as string);
    setProject(data);
    setLoading(false);
  }

  useEffect(() => {
    void loadProject();
  }, [token, id]);

  async function handleCreateTrack() {
  if (!trackTitle.trim() || !token || !id || !project) {
    return;
  }

  if (project.type === "ALBUM" && !trackOrder.trim()) {
    alert("Для альбома нужно указать номер трека");
    return;
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
    await createTrack(token, id as string, payload);
    setTrackTitle("");
    setTrackOrder("");
    await loadProject();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to create track");
  }
}

  async function handleCreateVersion(trackId: string) {
    const versionName = prompt("Version name");
    const fileUrl = prompt("File URL");

    if (!versionName || !fileUrl || !token) return;

    await createVersion(token, trackId, versionName, fileUrl);
    await loadProject();
  }

  async function handleCreateComment(trackId: string) {
    const text = prompt("Comment");

    if (!text || !token) return;

    await createComment(token, trackId, text);
    await loadProject();
  }

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
  <Protected>
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="text-3xl font-semibold">{project.title}</h1>
        <p className="mt-2 text-sm text-neutral-400">
          {project.type} • {project.status}
        </p>
      </div>

      {/* CREATE TRACK */}
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
            className="rounded-xl bg-white px-5 py-3 font-medium !text-black"
          >
            Add track
          </button>
        </div>

        {project.type === "ALBUM" ? (
          <p className="mt-2 text-sm text-neutral-500">
            Для альбома укажи порядок трека.
          </p>
        ) : null}
      </div>

      {/* TRACKS */}
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

            <div className="mt-3 flex flex-wrap gap-4">
              <button
                onClick={() => handleCreateVersion(track.id)}
                className="text-sm text-blue-400"
              >
                + Add version
              </button>

              <button
                onClick={() => handleCreateComment(track.id)}
                className="text-sm text-green-400"
              >
                + Comment
              </button>
            </div>

            {/* VERSIONS */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-neutral-300">Versions</p>

              {track.versions && track.versions.length > 0 ? (
                track.versions.map((v) => (
                  <div key={v.id} className="text-sm text-neutral-400">
                    🎵 {v.versionName}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No versions</p>
              )}
            </div>

            {/* COMMENTS */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-neutral-300">Comments</p>

              {track.comments && track.comments.length > 0 ? (
                track.comments.map((c) => (
                  <div key={c.id} className="text-sm text-neutral-500">
                    💬 {c.text}
                  </div>
                ))
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