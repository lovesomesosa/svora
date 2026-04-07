"use client";

import { useState } from "react";
import VersionList from "@/components/projects/VersionList";
import CommentList from "@/components/projects/CommentList";
import type { Track } from "@/lib/types";

type TrackCardProps = {
  track: Track;
  canEdit: boolean;
  versionName: string;
  fileUrl: string;
  commentText: string;
  versionLoading: boolean;
  commentLoading: boolean;
  versionError: string;
  commentError: string;
  onVersionNameChange: (value: string) => void;
  onFileUrlChange: (value: string) => void;
  onCommentTextChange: (value: string) => void;
  onCreateVersion: () => void;
  onCreateComment: () => void;
};

export default function TrackCard({
  track,
  canEdit,
  versionName,
  fileUrl,
  commentText,
  versionLoading,
  commentLoading,
  versionError,
  commentError,
  onVersionNameChange,
  onFileUrlChange,
  onCommentTextChange,
  onCreateVersion,
  onCreateComment,
}: TrackCardProps) {
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">
            {track.order ? `${track.order}. ` : ""}
            {track.title}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Created: {new Date(track.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
      </div>

      {canEdit ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setIsVersionFormOpen((prev) => !prev)}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            {isVersionFormOpen ? "Hide version form" : "Add version"}
          </button>

          <button
            onClick={() => setIsCommentFormOpen((prev) => !prev)}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            {isCommentFormOpen ? "Hide comment form" : "Add comment"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-500">
          Для этой роли доступен только просмотр.
        </div>
      )}

      {canEdit && isVersionFormOpen ? (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-sm font-medium text-neutral-300">Add version</p>

          <div className="mt-3 space-y-3">
            <input
              value={versionName}
              onChange={(e) => onVersionNameChange(e.target.value)}
              placeholder="Version name"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
            />

            <input
              value={fileUrl}
              onChange={(e) => onFileUrlChange(e.target.value)}
              placeholder="File URL"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
            />

            {versionError ? (
              <p className="text-sm text-red-400">{versionError}</p>
            ) : null}

            <button
              onClick={onCreateVersion}
              disabled={versionLoading}
              className="rounded-xl bg-white px-4 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {versionLoading ? "Добавляем..." : "Save version"}
            </button>
          </div>
        </div>
      ) : null}

      {canEdit && isCommentFormOpen ? (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-sm font-medium text-neutral-300">Add comment</p>

          <div className="mt-3 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              placeholder="Comment text"
              className="min-h-[110px] w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3"
            />

            {commentError ? (
              <p className="text-sm text-red-400">{commentError}</p>
            ) : null}

            <button
              onClick={onCreateComment}
              disabled={commentLoading}
              className="rounded-xl bg-white px-4 py-3 font-medium !text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {commentLoading ? "Добавляем..." : "Save comment"}
            </button>
          </div>
        </div>
      ) : null}

      <VersionList versions={track.versions} />
      <CommentList comments={track.comments} />
    </div>
  );
}