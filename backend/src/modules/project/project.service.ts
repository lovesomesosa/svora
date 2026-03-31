import { prisma } from "../../lib/prisma.js";
import { CreateProjectInput } from "./project.types.js";
import { AppError } from "../../utils/app-error.js";

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

export const getMyProjects = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return projects.map(serializeProject);
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
