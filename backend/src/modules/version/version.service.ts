import { prisma } from "../../lib/prisma.js";
import { CreateTrackVersionInput } from "./version.types.js";

const serializeVersion = (version: any) => ({
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
    throw new Error("Track not found");
  }

  const duplicateVersionName = track.versions.some(
    (version) => version.versionName.toLowerCase() === data.versionName.toLowerCase(),
  );

  if (duplicateVersionName) {
    throw new Error("Version with this name already exists for this track");
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