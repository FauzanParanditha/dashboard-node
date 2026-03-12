import api from "@/api";
import {
  canAccessAdminDashboard,
  clearStoredAuthMetadata,
  getStoredAuthMetadata,
  hasAnyPermission,
} from "@/utils/rbac";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const useAdminAuthGuard = (requiredPermissions: string[] = []) => {
  const router = useRouter();
  const permissionsKey = requiredPermissions.join("|");

  useEffect(() => {
    const authMeta = getStoredAuthMetadata();
    const token = authMeta.token;

    if (!token || !canAccessAdminDashboard(authMeta)) {
      router.replace("/auth/login");
      return;
    }

    if (!hasAnyPermission(authMeta, requiredPermissions)) {
      const currentPath = router.pathname;
      const fallbackPath = "/dashboard/home";
      const toastKey = `rbac:forbidden:${currentPath}:${permissionsKey}`;

      if (
        typeof window !== "undefined" &&
        !sessionStorage.getItem(toastKey) &&
        currentPath !== fallbackPath
      ) {
        sessionStorage.setItem(toastKey, "1");
        toast.error("Forbidden - You do not have access to this resource", {
          theme: "colored",
        });
      }

      if (currentPath !== fallbackPath) {
        router.replace(fallbackPath);
      }
      return;
    }

    api()
      .get("/me")
      .catch(() => {
        clearStoredAuthMetadata();
        router.replace("/auth/login");
      });
  }, [permissionsKey, router]);
};
