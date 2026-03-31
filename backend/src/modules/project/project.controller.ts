import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import * as projectService from "./project.service.js";
import {
  createProjectSchema,
  projectIdParamsSchema,
} from "./project.schema.js";

type ProjectIdParams = {
  id: string;
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const project = await projectService.createProject(
      req.user!.userId,
      parsed.data,
    );

    return success(res, project, "Project created", 201);
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to create project",
      400,
    );
  }
};

export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await projectService.getMyProjects(req.user!.userId);
    return success(res, projects, "Projects fetched");
  } catch {
    return failure(res, "Failed to fetch projects", 500);
  }
};

export const getProjectById = async (
  req: AuthRequest<ProjectIdParams>,
  res: Response,
) => {
  try {
    const parsedParams = projectIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return failure(
        res,
        "Validation failed",
        400,
        parsedParams.error.flatten(),
      );
    }

    const project = await projectService.getProjectById(
      parsedParams.data.id,
      req.user!.userId,
    );

    return success(res, project, "Project fetched");
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to fetch project",
      404,
    );
  }
};