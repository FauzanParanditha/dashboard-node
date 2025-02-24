import { tokenName } from "@/utils/var";
import { deleteCookie, getCookie } from "cookies-next";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

type AuthStatus = "authenticated" | "unauthorized";

// Rename userContext to useUserContextValue
const useUserContextValue = () => {
  const [auth, setAuth] = useState<AuthStatus>("unauthorized");
  const [isDark, setIsDark] = useState(false);

  const {
    isValidating,
    data: user,
    error,
    mutate,
  } = useSWR(getCookie(tokenName) ? "/me" : null, {
    dedupingInterval: 20000,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    refreshInterval: 20000,
  });

  const logout = () => {
    deleteCookie(tokenName);
    mutate();
    setAuth("unauthorized");
  };

  useEffect(() => {
    if (auth !== "authenticated") return;
    const checkToken = () => {
      const token = getCookie(tokenName);
      if (!token) {
        logout();
      }
    };

    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, [auth]);

  // Handle user authentication
  useEffect(() => {
    if (error) {
      if (error?.response?.status === 401) {
        // Delete cookies
        deleteCookie(tokenName);
        setAuth("unauthorized");
        if (window.location.pathname.includes("dashboard")) {
          toast.error(error.response.data?.messages, { theme: "colored" });
        }
      }
    } else if (user?.data) {
      setAuth("authenticated");
    } else if (!isValidating) {
      setAuth("unauthorized");
    }
  }, [isValidating, user, error]);

  // Handle dark or light theme
  useEffect(() => {
    if (window.localStorage?.theme === "dark") {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      window.document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      window.document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return {
    user: user?.data || {},
    auth,
    revalidate: mutate,
    isDark,
    setIsDark,
  };
};

const UserContext = createContext({} as ReturnType<typeof useUserContextValue>);

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }: any) => {
  const value = useUserContextValue(); // Use the renamed hook
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
