import { prisma } from "../../lib/prisma.js";
import { CreateProjectInput } from "./project.types.js";
import { AppError } from "../../utils/app-error.js";
import { getPagination } from "../../utils/pagination.js";

type SerializableTrack = {
  id: string;
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

type SerializableProject = {
  id: string;
  userId: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tracks?: SerializableTrack[];
};

const serializeProject = (project: SerializableProject) => ({
  id: project.id,
  userId: project.userId,
  title: project.title,
  type: project.type,
  status: project.status,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,

  ...(project.user && { user: project.user }),
  ...(project.tracks && { tracks: project.tracks }),
});

export const createProject = async (
  userId: string,
  data: CreateProjectInput,
) => {
  const project = await prisma.project.create({
    data: {
      userId,
      title: data.title,
      type: data.type,
    },
  });

  return serializeProject(project);
};

export const getMyProjects = async (
  userId: string,
  page?: string,
  limit?: string,
) => {
  const { skip, limit: take, page: currentPage } = getPagination(page, limit);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({
      where: { userId },
    }),
  ]);

  return {
    items: projects.map(serializeProject),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      pages: total === 0 ? 1 : Math.ceil(total / take),
    },
  };
};

export const getProjectById = async (projectId: string, userId: string) => {
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
  return serializeProject(project);
};

export const getAllProjects = async (page?: string, limit?: string) => {
  const { skip, limit: take, page: currentPage } = getPagination(page, limit);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take,
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
    }),
    prisma.project.count(),
  ]);

  return {
    items: projects.map(serializeProject),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      pages: total === 0 ? 1 : Math.ceil(total / take),
    },
  };
};