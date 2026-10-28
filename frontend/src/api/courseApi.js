import api from "./client";

export async function getCourses() {
  const response = await api.get("/api/courses");
  return response.data;
}
