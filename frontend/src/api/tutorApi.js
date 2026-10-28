import api from "./client";
export async function askTutor(payload) {
  const response = await api.post("/api/tutor/ask", {
    question: payload.question,
    topic: payload.topic ?? payload.language ?? "Programming",
    learnerLevel: payload.learnerLevel ?? "beginner",
  });
  return response.data;
}
