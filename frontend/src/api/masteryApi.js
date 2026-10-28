import api from "./client";
export async function getMastery(userId) {
  const response = await api.get(`/api/mastery/users/${userId}`); return response.data;
}
export async function updateMastery(userId, conceptId, payload) {
  const response = await api.put(`/api/mastery/users/${userId}/concepts/${conceptId}`, payload); return response.data;
}
export async function getConcepts() {
  const response = await api.get("/api/concepts"); return response.data;
}
