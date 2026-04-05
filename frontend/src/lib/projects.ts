import { apiRequest } from "@/lib/api";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
  Project,
  ProjectsResponse,
} from "@/lib/types";

function normalizeProjectsResponse(response: ProjectsResponse): Project[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.items;
}

export async function getProjects(token: string): Promise<Project[]> {
  const response = await apiRequest<ProjectsResponse>("/api/projects", {
    method: "GET",
    token,
  });

  return normalizeProjectsResponse(response);
}

export async function getAllProjects(
  token: string,
  page = 1,
  limit = 10
): Promise<Project[]> {
  const response = await apiRequest<ProjectsResponse>(
    `/api/projects/all?page=${page}&limit=${limit}`,
    {
      method: "GET",
      token,
    }
  );

  return normalizeProjectsResponse(response);
}

export async function createProject(
  token: string,
  payload: CreateProjectPayload
) {
  return apiRequest<CreateProjectResponse>("/api/projects", {
    method: "POST",
    token,
    body: payload,
  });
}
