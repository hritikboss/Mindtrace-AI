import api from "./client";

export async function signup(payload) {
  const response = await api.post("/api/auth/signup", payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/api/auth/login", payload);
  const data = response.data?.data ?? response.data;
  const token = data?.accessToken ?? data?.token ?? data?.access_token ?? data?.jwt;
  if (token) sessionStorage.setItem("accessToken", token);
  if (data?.userId != null) sessionStorage.setItem("mindtraceUser", JSON.stringify(data));
  return data;
}

export function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem("mindtraceUser") || "null"); }
  catch { return null; }
}

export function logout() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("mindtraceUser");
}
