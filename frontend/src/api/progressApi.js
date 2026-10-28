import api from "./client";
export async function getLessonProgress(userId, lessonId) {
  const response = await api.get(`/api/progress/users/${userId}/lessons/${lessonId}`); return response.data;
}
export async function getUserProgress(userId) {
  const response = await api.get(`/api/progress/users/${userId}`); return response.data;
}
export async function updateLessonProgress(userId, lessonId, progressPercentage) {
  const response = await api.put(`/api/progress/users/${userId}/lessons/${lessonId}`, { progressPercentage }); return response.data;
}
export async function getProgressSummary(userId) {
  const response = await api.get(`/api/progress/users/${userId}/summary`); return response.data;
}
