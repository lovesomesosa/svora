import { apiRequest } from "@/lib/api";

export async function createVersion(
  token: string,
  trackId: string,
  versionName: string,
  fileUrl: string,
) {
  return apiRequest(`/api/tracks/${trackId}/versions`, {
    method: "POST",
    token,
    body: { versionName, fileUrl },
  });
}