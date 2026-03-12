import { useUserContext } from "@/context/user";
import { getStoredAuthMetadata, hasAnyPermission, hasPermission } from "@/utils/rbac";

export const useRBAC = () => {
  const { authMeta } = useUserContext();
  const meta = authMeta?.permissions?.length ? authMeta : getStoredAuthMetadata();

  return {
    authMeta: meta,
    permissions: meta.permissions || [],
    roleId: meta.roleId,
    roleName: meta.roleName,
    hasPermission: (permission?: string) => hasPermission(meta, permission),
    hasAnyPermission: (permissions: string[] = []) =>
      hasAnyPermission(meta, permissions),
  };
};
