import api from "@/api";
import type { AuthMetadata } from "@/types/rbac";
import { jwtConfig } from "@/utils/var";
import {
  clearStoredAuthMetadata,
  extractAuthMetadata,
  getStoredAuthMetadata,
  persistAuthMetadata,
} from "@/utils/rbac";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

type AuthStatus = "authenticated" | "unauthorized";

const useUserContextValue = () => {
  const [auth, setAuth] = useState<AuthStatus>("unauthorized");
  const [isDark, setIsDark] = useState(false);
  const [authMeta, setAuthMeta] = useState<AuthMetadata>(() =>
    getStoredAuthMetadata(),
  );

  const hasToken =
    typeof window !== "undefined" &&
    (!!localStorage.getItem(jwtConfig.admin.accessTokenName) ||
      !!localStorage.getItem(jwtConfig.user.accessTokenName));

  const { isValidating, data, error, mutate } = useSWR(
    hasToken ? "/me" : null,
    () =>
      api()
        .get("/me")
        .then((res) => res.data),
  );

  const logout = () => {
    clearStoredAuthMetadata();
    setAuthMeta({ permissions: [] });
    setAuth("unauthorized");
    mutate(undefined, false);
  };

  // Handle authentication state
  useEffect(() => {
    if (error) {
      if (error?.response?.status === 401) {
        logout();

        if (window.location.pathname.includes("dashboard")) {
          toast.error("Session expired. Please login again.", {
            theme: "colored",
          });
        }
      }
      return;
    }

    if (data?.success) {
      const nextMeta = extractAuthMetadata({
        ...data,
        ...(data.data || {}),
      });
      setAuthMeta(nextMeta);
      persistAuthMetadata(nextMeta);
      setAuth("authenticated");
    } else if (!isValidating) {
      setAuth("unauthorized");
    }
  }, [data, error, isValidating]);

  // Handle dark mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return {
    user: data?.data || {},
    authMeta,
    auth,
    revalidate: mutate,
    logout,
    isDark,
    setIsDark,
  };
};

const UserContext = createContext({} as ReturnType<typeof useUserContextValue>);

export const useUserContext = () => useContext(UserContext);

export const UserContextProvider = ({ children }: any) => {
  const value = useUserContextValue();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
