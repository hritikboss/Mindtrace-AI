import api from "./client";
export async function getRewards(userId) {
  const response = await api.get(`/api/gamification/users/${userId}/rewards`); return response.data;
}
export async function getPoints(userId) {
  const response = await api.get(`/api/gamification/users/${userId}/points`); return response.data;
}
export async function createReward(userId, { code, title, points = 0 }) {
  const response = await api.post(`/api/gamification/users/${userId}/rewards`, null, { params: { code, title, points } }); return response.data;
}
