import { jwtConfig } from "@/utils/var";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";

const api = () => {
  const path = window.location.pathname;

  const Axios = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_CLIENT_API_URL || process.env.SERVER_API_URL,
    withCredentials: true,
    timeout: 30000,
  });

  //request
  Axios.interceptors.request.use((config: any) => {
    const token = getCookie(jwtConfig.admin.accessTokenName);
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  });

  //response
  Axios.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error),
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
        toast.error(error.response?.data?.message ?? "Unauthorized", {
          theme: "colored",
        });
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
