import api from "./client";
export async function getLessons(moduleId) { const r = await api.get(`/api/lessons/module/${moduleId}`); return r.data; }
