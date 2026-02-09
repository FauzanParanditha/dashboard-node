import api from "@/api";
import { jwtConfig } from "@/utils/var";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

type AuthStatus = "authenticated" | "unauthorized";

const useUserContextValue = () => {
  const [auth, setAuth] = useState<AuthStatus>("unauthorized");
  const [isDark, setIsDark] = useState(false);

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
    localStorage.removeItem(jwtConfig.admin.accessTokenName);
    localStorage.removeItem(jwtConfig.user.accessTokenName);
    localStorage.removeItem(jwtConfig.admin.roleName);
    localStorage.removeItem(jwtConfig.admin.adminIdName);
    localStorage.removeItem(jwtConfig.admin.userIdName);
    localStorage.removeItem(jwtConfig.user.roleName);
    localStorage.removeItem(jwtConfig.user.userIdName);
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
