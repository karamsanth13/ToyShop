import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

export function getApiMessage(error, fallback) {
  return error?.response?.data?.error?.message || fallback;
}
