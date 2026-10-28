import api from "./client";

export async function createKnowledgeLink(payload) {
  const response = await api.post("/api/knowledge-graph/links", payload);
  return response.data;
}

export async function getConceptLinks(conceptId) {
  const response = await api.get(`/api/knowledge-graph/concepts/${conceptId}/links`);
  return response.data;
}
