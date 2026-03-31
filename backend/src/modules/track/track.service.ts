import { prisma } from "../../lib/prisma.js";
import { CreateTrackInput } from "./track.types.js";

const serializeTrack = (track: any) => ({
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
    throw new Error("Project not found");
  }

  if (project.type === "SINGLE" && project.tracks.length >= 1) {
    throw new Error("Single project can contain only one track");
  }

  if (project.type === "ALBUM") {
    if (!data.order) {
      throw new Error("Order is required for album tracks");
    }

    const orderExists = project.tracks.some((track) => track.order === data.order);

    if (orderExists) {
      throw new Error("Track with this order already exists");
    }
  }

  if (project.type === "SINGLE" && data.order !== undefined) {
    throw new Error("Order is not allowed for single project");
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