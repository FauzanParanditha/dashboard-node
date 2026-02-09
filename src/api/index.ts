import { jwtConfig } from "@/utils/var";
import axios from "axios";
import { toast } from "react-toastify";

const api = () => {
  const Axios = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_CLIENT_API_URL || process.env.SERVER_API_URL,
    timeout: 30000,
  });

  // REQUEST INTERCEPTOR
  Axios.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem(jwtConfig.admin.accessTokenName) ||
          localStorage.getItem(jwtConfig.user.accessTokenName);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // RESPONSE INTERCEPTOR
  Axios.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(jwtConfig.admin.accessTokenName);
        localStorage.removeItem(jwtConfig.user.accessTokenName);
        localStorage.removeItem(jwtConfig.admin.roleName);
        localStorage.removeItem(jwtConfig.admin.adminIdName);
        localStorage.removeItem(jwtConfig.admin.userIdName);
        localStorage.removeItem(jwtConfig.user.roleName);
        localStorage.removeItem(jwtConfig.user.userIdName);

        toast.error("Session expired. Please login again.", {
          theme: "colored",
        });

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      return Promise.reject(error);
    },
  );

  return Axios;
};

export const handleAxiosError = (error: any) => {
  if (typeof error === "object" && error !== null) {
    const status = error.response?.status;
    const msg =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      error.message ||
      "Network error";

    switch (status) {
      case 401:
        // toast.error(error.response?.data?.message ?? "Unauthorized", {
        //   theme: "colored",
        // });
        break;

      case 403:
        toast.error(
          error.response?.data?.message ??
            "Forbidden - You do not have access to this resource",
          { theme: "colored" },
        );
        break;

      case 422: {
        const message = error.response?.data?.message;
        if (Array.isArray(message)) {
          message.forEach((item: any) => {
            toast.error(`${item.field} : ${item.reason}`, { theme: "colored" });
          });
        } else {
          toast.error(message ?? "Validation error", { theme: "colored" });
        }
        break;
      }

      default:
        toast.error(typeof msg === "string" ? msg : "internal server error", {
          theme: "colored",
        });
        break;
    }

    // kalau error.response undefined, kasih toast khusus
    if (!error.response) {
      toast.error(error.message || "No response from server", {
        theme: "colored",
      });
    }
  }
};

export default api;
