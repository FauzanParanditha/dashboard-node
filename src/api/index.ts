import { tokenName } from "@/utils/var";
import axios from "axios";
import { deleteCookie, getCookie } from "cookies-next";
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
    const token = getCookie(tokenName);
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  });
  //response
  Axios.interceptors.response.use(
    (response: any) => {
      return response;
    },
    (error: any) => {
      return new Promise((resolve, reject) => {
        if (typeof error === "object" && error !== null) {
          //check errror
          if (error.response) {
            if (path.startsWith("dashboard")) {
              const status = error.response?.status;
              switch (status) {
                case 401:
                  deleteCookie(tokenName);
                  toast.error(
                    error.response?.data?.message
                      ? error.response.data.message
                      : "Unauthorized",
                    { theme: "colored" },
                  );
                  break;
                default:
                  toast.error(
                    error.response?.data?.message
                      ? error.response.data.message
                      : "internal server error",
                    { theme: "colored" },
                  );
              }
            }
          }
          return reject(error);
        }
      });
    },
  );
  return Axios;
};

export const handleAxiosError = (error: any) => {
  if (typeof error === "object" && error !== null) {
    const msg = error.response.data.errors;
    switch (error.response?.status) {
      case 401:
        toast.error(
          error.response?.data?.message
            ? error.response.data.message
            : "Unauthorized",
          { theme: "colored" },
        );
        break;
      case 403:
        toast.error(
          error.response?.data?.message ||
            "Forbidden - You do not have access to this resource",
          { theme: "colored" },
        );
        break;
      case 422:
        //check type error is object
        if (
          error.response?.data?.message != undefined &&
          typeof error.response?.data?.message == "object"
        ) {
          //loop error
          error.response?.data?.message.forEach((item: any) => {
            toast.error(item.field + " : " + item.reason, { theme: "colored" });
          });
        } else {
          toast.error(error.response?.data?.message, { theme: "colored" });
        }
        break;
      default:
        toast.error(msg ? msg : "internal server error", { theme: "colored" });
        break;
    }
  }
};

export default api;
