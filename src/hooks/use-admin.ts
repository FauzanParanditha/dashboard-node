import api from "@/api";
import { jwtConfig } from "@/utils/var";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useAdminAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(jwtConfig.admin.accessTokenName);

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    api()
      .get("/me")
      .catch(() => {
        localStorage.removeItem(jwtConfig.admin.accessTokenName);
        router.replace("/auth/login");
      });
  }, []);
};
