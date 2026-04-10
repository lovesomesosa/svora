"use client";

import { useMemo, useState } from "react";
import type { Version } from "@/lib/types";

type VersionListProps = {
  versions?: Version[];
};

function sortVersionsByDate(versions: Version[]) {
  return [...versions].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export default function VersionList({ versions }: VersionListProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedVersions = useMemo(() => {
    if (!versions || versions.length === 0) {
      return [];
    }

    return sortVersionsByDate(versions);
  }, [versions]);

  const mainVersion = sortedVersions[0];
  const otherVersions = sortedVersions.slice(1);

  const hasVersions = sortedVersions.length > 0;

  return (
    <div className="mt-5 space-y-3">
      
      {hasVersions && mainVersion ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
          <div className="flex flex-col gap-3">
            <div>
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[12px] text-green-300"> 
                Latest
              </span>
              <p className="font-medium text-neutral-200">
                🎵 {mainVersion.versionName}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {new Date(mainVersion.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>

            <audio
              controls
              preload="none"
              className="w-full"
              src={mainVersion.fileUrl}
            >
              Ваш браузер не поддерживает аудиоплеер.
            </audio>

            <a
              href={mainVersion.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-xs text-blue-400 hover:text-blue-300"
            >
              {mainVersion.fileUrl}
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-500">
          Пока нет версий.
        </div>
      )}

      {otherVersions.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-300">
              Предыдущие версии
            </p>

            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              {isOpen ? "Hide" : `Show (${otherVersions.length})`}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-3 pt-2">
              {otherVersions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-medium text-neutral-200">
                        🎵 {version.versionName}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {new Date(version.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>

                    <audio
                      controls
                      preload="none"
                      className="w-full"
                      src={version.fileUrl}
                    >
                      Ваш браузер не поддерживает аудиоплеер.
                    </audio>

                    <a
                      href={version.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-xs text-blue-400 hover:text-blue-300"
                    >
                      {version.fileUrl}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}