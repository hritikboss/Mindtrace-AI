import api from "./client";
export async function getAnalytics(userId) {
  const response = await api.get(`/api/analytics/users/${userId}`);
  return response.data;
}
