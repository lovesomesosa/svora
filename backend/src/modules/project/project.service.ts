import { prisma } from "../../lib/prisma.js";
import { CreateProjectInput } from "./project.types.js";

const serializeProject = (project: any) => ({
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
    throw new Error("Project not found");
  }

  return serializeProject(project);
};