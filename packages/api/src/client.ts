import { getAccessToken } from "@serrale/auth";
import { getApiBaseUrl } from "@serrale/config";
import axios from "axios";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
