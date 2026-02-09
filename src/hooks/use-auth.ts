import api from "@/api";
import { jwtConfig } from "@/utils/var";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem(jwtConfig.admin.accessTokenName) ||
      localStorage.getItem(jwtConfig.user.accessTokenName);

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    api()
      .get("/me")
      .catch(() => {
        localStorage.removeItem(jwtConfig.admin.accessTokenName);
        localStorage.removeItem(jwtConfig.user.accessTokenName);
        localStorage.removeItem(jwtConfig.admin.roleName);
        localStorage.removeItem(jwtConfig.admin.adminIdName);
        localStorage.removeItem(jwtConfig.admin.userIdName);
        localStorage.removeItem(jwtConfig.user.roleName);
        localStorage.removeItem(jwtConfig.user.userIdName);
        router.replace("/auth/login");
      });
  }, []);
};
