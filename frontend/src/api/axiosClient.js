import axios from "axios";
import { getToken, clearSession } from "../auth/tokenStorage";

const axiosClient = axios.create({
  baseURL:
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      /*
       * IMPORTANT :
       * Quand on envoie un FormData, on ne doit PAS forcer
       * application/json.
       *
       * Le navigateur/Axios va automatiquement définir :
       *
       * multipart/form-data; boundary=...
       */
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => response,

    (error) => {
      const status = error.response?.status;

      const isLoginCall =
          error.config?.url?.includes("/auth/login");

      if (status === 401 && !isLoginCall) {
        clearSession();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
);

export default axiosClient;

/**
 * Extraire le message d'erreur renvoyé par le backend.
 */
export function extractErrorMessage(error) {
  const data = error.response?.data;

  if (
      data?.fieldErrors &&
      Object.keys(data.fieldErrors).length > 0
  ) {
    return Object.values(data.fieldErrors).join(" - ");
  }

  if (data?.message) {
    return data.message;
  }

  return "Une erreur est survenue. Veuillez reessayer.";
}