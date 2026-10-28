import api from "./client";
export async function getModules(courseId) { const r = await api.get(`/api/modules/course/${courseId}`); return r.data; }
