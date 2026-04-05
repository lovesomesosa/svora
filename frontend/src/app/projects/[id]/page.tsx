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
    if (!trackTitle || !token) return;

    await createTrack(token, id as string, trackTitle);
    setTrackTitle("");
    await loadProject();
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
        <h1 className="text-3xl font-semibold">{project.title}</h1>

        {/* CREATE TRACK */}
        <div className="flex gap-2">
          <input
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value)}
            placeholder="Track title"
            className="rounded-xl bg-neutral-900 px-4 py-2"
          />
          <button
            onClick={handleCreateTrack}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            Add track
          </button>
        </div>

        {/* TRACKS */}
        <div className="space-y-4">
          {project.tracks.map((track: Track) => (
            <div
              key={track.id}
              className="border border-neutral-800 p-4 rounded-xl"
            >
              <h2 className="text-xl">{track.title}</h2>

              <button
                onClick={() => handleCreateVersion(track.id)}
                className="text-sm text-blue-400"
              >
                + Add version
              </button>

              <button
                onClick={() => handleCreateComment(track.id)}
                className="ml-3 text-sm text-green-400"
              >
                + Comment
              </button>

              {/* VERSIONS */}
              <div className="mt-3 space-y-1">
                {track.versions?.map((v) => (
                  <div key={v.id} className="text-sm text-neutral-400">
                    🎵 {v.versionName}
                  </div>
                ))}
              </div>

              {/* COMMENTS */}
              <div className="mt-3 space-y-1">
                {track.comments?.map((c) => (
                  <div key={c.id} className="text-sm text-neutral-500">
                    💬 {c.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Protected>
  );
}