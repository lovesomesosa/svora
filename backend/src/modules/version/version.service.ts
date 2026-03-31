import { prisma } from "../../lib/prisma.js";
import { CreateTrackVersionInput } from "./version.types.js";
import { AppError } from "../../utils/app-error.js";

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
