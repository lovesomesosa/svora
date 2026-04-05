import { apiRequest } from "@/lib/api";

export async function createTrack(
  token: string,
  projectId: string,
  title: string,
) {
  return apiRequest(`/api/projects/${projectId}/tracks`, {
    method: "POST",
    token,
    body: { title },
  });
}