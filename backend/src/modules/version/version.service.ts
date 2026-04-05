import { prisma } from "../../lib/prisma.js";
import { CreateTrackVersionInput } from "./version.types.js";
import { AppError } from "../../utils/app-error.js";
import { getPagination } from "../../utils/pagination.js";

type SerializableVersion = {
  id: string;
  trackId: string;
  versionName: string;
  fileUrl: string;
  createdAt: Date;
};

const serializeVersion = (version: SerializableVersion) => ({
  id: version.id,
  trackId: version.trackId,
  versionName: version.versionName,
  fileUrl: version.fileUrl,
  createdAt: version.createdAt,
});

export const createTrackVersion = async (
  trackId: string,
  userId: string,
  data: CreateTrackVersionInput,
) => {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      project: {
        userId,
      },
    },
    include: {
      versions: true,
    },
  });

  if (!track) {
    throw new AppError("Track not found", 404);
  }

  const duplicateVersionName = track.versions.some(
    (version) =>
      version.versionName.toLowerCase() === data.versionName.toLowerCase(),
  );

  if (duplicateVersionName) {
    throw new AppError(
      "Version with this name already exists for this track",
      409,
    );
  }

  const version = await prisma.trackVersion.create({
    data: {
      trackId,
      versionName: data.versionName,
      fileUrl: data.fileUrl,
    },
  });

  return serializeVersion(version);
};

export const getAllVersions = async (page?: string, limit?: string) => {
  const { skip, limit: take, page: currentPage } = getPagination(page, limit);

  const [versions, total] = await Promise.all([
    prisma.trackVersion.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            order: true,
            project: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
              },
            },
          },
        },
      },
    }),
    prisma.trackVersion.count(),
  ]);

  return {
    items: versions.map((version) => ({
      ...serializeVersion(version),
      track: version.track,
    })),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      pages: total === 0 ? 1 : Math.ceil(total / take),
    },
  };
};

export const getTrackVersions = async (
  trackId: string,
  userId: string,
  role: string
) => {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      ...(role === "OWNER"
        ? {} // OWNER может видеть все треки
        : {
            project: {
              userId,
            },
          }),
    },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!track) {
    throw new AppError("Track not found", 404);
  }

  return track.versions.map(serializeVersion);
};