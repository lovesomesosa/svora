import { apiRequest } from "@/lib/api";
import type { ProjectDetailsResponse } from "@/lib/types";

export async function getProjectById(token: string, projectId: string) {
  const response = await apiRequest<ProjectDetailsResponse>(
    `/api/projects/${projectId}`,
    {
      method: "GET",
      token,
    }
  );

  return response.data;
}
