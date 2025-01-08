import { tokenName } from "@/utils/var";
import { deleteCookie } from "cookies-next";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

type AuthStatus = "authenticated" | "unauthorized";

const userContext = () => {
  const [auth, setAuth] = useState<AuthStatus>("unauthorized");
  const [isDark, setIsDark] = useState(false);

  const {
    isValidating,
    data: user,
    error,
    mutate,
  } = useSWR("/me", {
    dedupingInterval: 20000,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    refreshInterval: 20000,
  });
  //handle user authentication
  useEffect(() => {
    if (error) {
      if (error?.response?.status === 401) {
        if (window.location.pathname.includes("dashboard")) {
          toast.error(error.response.data?.messages, { theme: "colored" });
        }
        //delete cookies
        deleteCookie(tokenName);
        setAuth("unauthorized");
      }
    } else if (user?.data) {
      setAuth("authenticated");
    } else if (!isValidating) {
      setAuth("unauthorized");
    }
  }, [isValidating, user, error]);

  //handle dark or light
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

const UserContext = createContext({} as ReturnType<typeof userContext>);

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }: any) => {
  const value = userContext();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
