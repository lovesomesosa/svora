import { apiRequest } from "@/lib/api";

type CreateTrackPayload = {
  title: string;
  order?: number;
};

export async function createTrack(
  token: string,
  projectId: string,
  payload: CreateTrackPayload
) {
  return apiRequest(`/api/projects/${projectId}/tracks`, {
    method: "POST",
    token,
    body: payload,
  });
}
