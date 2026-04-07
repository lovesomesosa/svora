"use client";

import { useState } from "react";
import type { Version } from "@/lib/types";

type VersionListProps = {
  versions?: Version[];
};

export default function VersionList({ versions }: VersionListProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasVersions = Boolean(versions && versions.length > 0);

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-300">Versions</p>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          {isOpen ? "Hide" : `Show (${versions?.length ?? 0})`}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2">
          {hasVersions ? (
            <div className="space-y-2">
              {versions!.map((version) => (
                <div
                  key={version.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-400"
                >
                  <p className="font-medium text-neutral-200">
                    🎵 {version.versionName}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(version.createdAt).toLocaleString("ru-RU")}
                  </p>

                  <a
                    href={version.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-xs text-blue-400 hover:text-blue-300"
                  >
                    {version.fileUrl}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
              Пока нет версий.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}