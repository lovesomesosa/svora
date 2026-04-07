"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";

type CommentListProps = {
  comments?: Comment[];
};

export default function CommentList({ comments }: CommentListProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasComments = comments && comments.length > 0;

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-300">Comments</p>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          {isOpen ? "Hide" : `Show (${comments?.length ?? 0})`}
        </button>
      </div>

      {isOpen ? (
        hasComments ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-400"
              >
                <p className="text-neutral-200">{comment.text}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  {comment.user ? (
                    <>
                      <span className="font-medium text-neutral-300">
                        {comment.user.name}
                      </span>
                      <span>•</span>
                      <span>{comment.user.role}</span>
                    </>
                  ) : (
                    <span>Unknown author</span>
                  )}

                  <span>•</span>
                  <span>
                    {new Date(comment.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
            Пока нет комментариев.
          </div>
        )
      ) : null}
    </div>
  );
}