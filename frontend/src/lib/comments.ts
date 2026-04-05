import { apiRequest } from "@/lib/api";

export async function createComment(
  token: string,
  trackId: string,
  text: string,
) {
  return apiRequest(`/api/tracks/${trackId}/comments`, {
    method: "POST",
    token,
    body: { text },
  });
}