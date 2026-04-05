import { prisma } from "../../lib/prisma.js";
import { CreateTrackInput } from "./track.types.js";
import { AppError } from "../../utils/app-error.js";
import { getPagination } from "../../utils/pagination.js";

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
  role: string,
  data: CreateTrackInput,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(role === "OWNER" ? {} : { userId }),
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

export const getAllTracks = async (page?: string, limit?: string) => {
  const { skip, limit: take, page: currentPage } = getPagination(page, limit);

  const [tracks, total] = await Promise.all([
    prisma.track.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    }),
    prisma.track.count(),
  ]);

  return {
    items: tracks.map((track) => ({
      ...serializeTrack(track),
      project: track.project,
    })),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      pages: total === 0 ? 1 : Math.ceil(total / take),
    },
  };
};

export const getTrackById = async (trackId: string, userId: string) => {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      project: {
        userId,
      },
    },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!track) {
    throw new AppError("Track not found", 404);
  }

  return serializeTrack(track);
};

export const getTracksByProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      tracks: {
        orderBy: { createdAt: "asc" },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project.tracks.map((track) => ({
    id: track.id,
    projectId: track.projectId,
    title: track.title,
    order: track.order,
    createdAt: track.createdAt,
    updatedAt: track.updatedAt,
    versions: track.versions,
    comments: track.comments,
  }));
};