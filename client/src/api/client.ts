import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true
});

const readCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

api.interceptors.request.use((config) => {
  const csrfToken = readCookie("csrfToken");
  if (csrfToken && config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers = config.headers ?? {};
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && original.url !== "/auth/refresh") {
      original._retry = true;
      await api.post("/auth/refresh");
      return api(original);
    }
    return Promise.reject(error);
  }
);
