import { prisma } from "../../lib/prisma.js";
import { CreateTrackInput } from "./track.types.js";
import { AppError } from "../../utils/app-error.js";

type SerializableTrack = {
  id: string;
  projectId: string;
  title: string;
  order: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Временно используем unknown[],
  // так как структура вложенных данных (versions, comments) ещё не типизирована.
  // В дальнейшем заменить на конкретные DTO-типы.
  versions?: unknown[];
  comments?: unknown[];
};

const serializeTrack = (track: SerializableTrack) => ({
  id: track.id,
  projectId: track.projectId,
  title: track.title,
  order: track.order,
  createdAt: track.createdAt,
  updatedAt: track.updatedAt,
  ...(track.versions && { versions: track.versions }),
  ...(track.comments && { comments: track.comments }),
});

export const createTrack = async (
  projectId: string,
  userId: string,
  data: CreateTrackInput,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      tracks: true,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.type === "SINGLE" && project.tracks.length >= 1) {
    throw new AppError("Single project can contain only one track", 400);
  }

  if (project.type === "ALBUM") {
    if (!data.order) {
      throw new AppError("Order is required for album tracks", 400);
    }

    const orderExists = project.tracks.some(
      (track) => track.order === data.order,
    );

    if (orderExists) {
      throw new AppError("Track with this order already exists", 409);
    }
  }

  if (project.type === "SINGLE" && data.order !== undefined) {
    throw new AppError("Order is not allowed for single project", 400);
  }

  const track = await prisma.track.create({
    data: {
      projectId,
      title: data.title,
      order: project.type === "ALBUM" ? data.order : null,
    },
  });

  return serializeTrack(track);
};
