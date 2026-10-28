import api from "./client";

export async function createLessonQuiz(lessonId, payload) {
  const response = await api.post(`/api/quizzes/lesson/${lessonId}`, payload);
  return response.data;
}

export async function getLessonQuizzes(lessonId) {
  const response = await api.get(`/api/quizzes/lesson/${lessonId}`);
  return response.data;
}

export async function getQuizQuestions(quizId) {
  const response = await api.get(`/api/quizzes/${quizId}/questions`);
  return response.data;
}

export async function addQuizQuestion(quizId, payload) {
  const response = await api.post(`/api/quizzes/${quizId}/questions`, payload);
  return response.data;
}

export async function submitQuiz(quizId, payload) {
  const response = await api.post(`/api/quizzes/${quizId}/submit`, payload);
  return response.data;
}
