import { jwtConfig } from "@/utils/var";
import type { AuthMetadata, PermissionGroup, PermissionKey, Role } from "@/types/rbac";

export const RBAC_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissions: [
      { key: "dashboard:view", label: "View dashboard" },
      {
        key: "dashboard:view_real_amount",
        label: "View real amount metrics",
      },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    permissions: [
      { key: "admin:list", label: "List admins" },
      { key: "admin:read", label: "Read admin detail" },
      { key: "admin:create", label: "Create admin" },
      { key: "admin:update", label: "Update admin" },
      { key: "admin:delete", label: "Delete admin" },
    ],
  },
  {
    key: "role",
    label: "Role",
    permissions: [
      { key: "role:list", label: "List roles" },
      { key: "role:read", label: "Read role detail" },
      { key: "role:create", label: "Create role" },
      { key: "role:update", label: "Update role" },
      { key: "role:delete", label: "Delete role" },
    ],
  },
  {
    key: "user",
    label: "User",
    permissions: [
      { key: "user:list", label: "List users" },
      { key: "user:read", label: "Read user detail" },
      { key: "user:create", label: "Create user" },
      { key: "user:update", label: "Update user" },
      { key: "user:delete", label: "Delete user" },
    ],
  },
  {
    key: "client",
    label: "Client",
    permissions: [
      { key: "client:list", label: "List clients" },
      { key: "client:read", label: "Read client detail" },
      { key: "client:create", label: "Create client" },
      { key: "client:update", label: "Update client" },
      { key: "client:delete", label: "Delete client" },
    ],
  },
  {
    key: "client-key",
    label: "Client Key",
    permissions: [
      { key: "client_key:list", label: "List client keys" },
      { key: "client_key:read", label: "Read client key detail" },
      { key: "client_key:create", label: "Create client key" },
      { key: "client_key:update", label: "Update client key" },
      { key: "client_key:delete", label: "Delete client key" },
    ],
  },
  {
    key: "available-payment",
    label: "Available Payment",
    permissions: [
      {
        key: "available_payment:create",
        label: "Create available payment",
      },
      {
        key: "available_payment:update",
        label: "Update available payment",
      },
      {
        key: "available_payment:delete",
        label: "Delete available payment",
      },
    ],
  },
  {
    key: "order",
    label: "Order",
    permissions: [
      { key: "order:list", label: "List orders" },
      { key: "order:read", label: "Read order detail" },
      { key: "order:update", label: "Update order" },
      { key: "order:export", label: "Export orders" },
    ],
  },
  {
    key: "ip",
    label: "IP",
    permissions: [
      { key: "whitelist:list", label: "List IP entries" },
      { key: "whitelist:read", label: "Read IP entry" },
      { key: "whitelist:create", label: "Create IP entry" },
      { key: "whitelist:update", label: "Update IP entry" },
      { key: "whitelist:delete", label: "Delete IP entry" },
    ],
  },
  {
    key: "logs",
    label: "Logs",
    permissions: [
      { key: "log:activity", label: "View activity logs" },
      { key: "log:api", label: "View API logs" },
      { key: "log:email", label: "View email logs" },
      { key: "log:callback", label: "View callback logs" },
      { key: "log:retry", label: "View failed callback logs" },
    ],
  },
];

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  user: "User",
  client: "Client",
  client_key: "Client Key",
  order: "Order",
  category: "Category",
  available_payment: "Available Payment",
  whitelist: "IP Whitelist",
  log: "Logs",
  role: "Role",
};

export const ALL_PERMISSION_KEYS = RBAC_PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key),
);

const LEGACY_ROLE_PERMISSION_MAP: Record<string, string[]> = {
  admin: ALL_PERMISSION_KEYS.filter(
    (permission) =>
      !["role:create", "role:update", "role:delete"].includes(permission),
  ),
  finance: [
    "dashboard:view",
    "order:list",
    "order:read",
    "order:export",
    "log:api",
    "log:email",
    "log:callback",
    "log:activity",
    "client:list",
    "client:read",
  ],
  user: [
    "dashboard:view",
    "order:list",
    "order:read",
    "order:export",
    "client:list",
    "client:read",
    "client:update",
    "client_key:list",
    "client_key:read",
    "client_key:update",
  ],
};

const PERMISSION_ALIAS_MAP: Record<string, string> = {
  "dashboard:read": "dashboard:view",
  "dashboard:view_real_amount": "dashboard:view_real_amount",
  "ip:list": "whitelist:list",
  "ip:read": "whitelist:read",
  "ip:create": "whitelist:create",
  "ip:update": "whitelist:update",
  "ip:delete": "whitelist:delete",
  "available-payment:list": "available_payment:update",
  "available-payment:read": "available_payment:update",
  "available-payment:create": "available_payment:create",
  "available-payment:update": "available_payment:update",
  "available-payment:delete": "available_payment:delete",
  "client-key:list": "client_key:list",
  "client-key:read": "client_key:read",
  "client-key:create": "client_key:create",
  "client-key:update": "client_key:update",
  "client-key:delete": "client_key:delete",
  "logs:activity": "log:activity",
  "logs:api": "log:api",
  "logs:email": "log:email",
  "logs:callback": "log:callback",
  "logs:failed-callback": "log:retry",
  "settings:read": "dashboard:view",
  "settings:update": "dashboard:view",
};

const normalizePermission = (permission?: string) => {
  if (!permission) return "";
  return PERMISSION_ALIAS_MAP[permission] || permission;
};

const normalizeId = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const maybeValue = value as Record<string, unknown>;
    return String(maybeValue._id || maybeValue.id || "");
  }
  return "";
};

const normalizeRole = (value: unknown): Partial<Role> => {
  if (typeof value === "string") {
    return {
      _id: "",
      name: value,
      permissions: [],
    };
  }

  if (value && typeof value === "object") {
    const role = value as Record<string, unknown>;
    return {
      _id: normalizeId(role),
      name: String(role.name || role.label || role.role || ""),
      description: String(role.description || ""),
      permissions: Array.isArray(role.permissions)
        ? role.permissions.map((permission) => String(permission))
        : [],
    };
  }

  return {
    _id: "",
    name: "",
    permissions: [],
  };
};

export const extractAuthMetadata = (source: any): AuthMetadata => {
  const roleIdCandidate = source?.roleId;
  const roleCandidate =
    (roleIdCandidate &&
    typeof roleIdCandidate === "object" &&
    !Array.isArray(roleIdCandidate)
      ? roleIdCandidate
      : null) ??
    source?.role ??
    source?.roleData;
  const normalizedRole = normalizeRole(roleCandidate);
  const permissionsSource = [
    ...(Array.isArray(source?.permissions) ? source.permissions : []),
    ...(Array.isArray(normalizedRole.permissions)
      ? normalizedRole.permissions
      : []),
  ];

  return {
    token: typeof source?.token === "string" ? source.token : undefined,
    roleId:
      normalizeId(source?.roleId) ||
      (source?.role &&
      typeof source.role === "object" &&
      !Array.isArray(source.role)
        ? normalizeId(source.role)
        : "") ||
      normalizedRole._id ||
      undefined,
    roleName:
      (typeof source?.role === "string" ? source.role : "") ||
      normalizedRole.name ||
      undefined,
    permissions: Array.from(
      new Set(
        permissionsSource
          .map((permission) =>
            normalizePermission(String(permission || "").trim()),
          )
          .filter(Boolean),
      ),
    ),
    adminId: normalizeId(source?.adminId) || undefined,
    userId:
      normalizeId(source?.userId) || normalizeId(source?._id) || undefined,
  };
};

export const clearStoredAuthMetadata = () => {
  if (typeof window === "undefined") return;

  [
    jwtConfig.admin.accessTokenName,
    jwtConfig.user.accessTokenName,
    jwtConfig.admin.roleName,
    jwtConfig.user.roleName,
    jwtConfig.admin.adminIdName,
    jwtConfig.admin.userIdName,
    jwtConfig.user.userIdName,
    jwtConfig.admin.roleIdName,
    jwtConfig.user.roleIdName,
    jwtConfig.admin.permissionsName,
    jwtConfig.user.permissionsName,
  ].forEach((key) => localStorage.removeItem(key));
};

export const persistAuthMetadata = (meta: AuthMetadata) => {
  if (typeof window === "undefined") return;

  if (meta.token) {
    localStorage.setItem(jwtConfig.admin.accessTokenName, meta.token);
    localStorage.setItem(jwtConfig.user.accessTokenName, meta.token);
  }

  if (meta.roleName) {
    localStorage.setItem(jwtConfig.admin.roleName, meta.roleName);
    localStorage.setItem(jwtConfig.user.roleName, meta.roleName);
  }

  if (meta.roleId) {
    localStorage.setItem(jwtConfig.admin.roleIdName, meta.roleId);
    localStorage.setItem(jwtConfig.user.roleIdName, meta.roleId);
  }

  if (meta.adminId) {
    localStorage.setItem(jwtConfig.admin.adminIdName, meta.adminId);
  }

  if (meta.userId) {
    localStorage.setItem(jwtConfig.admin.userIdName, meta.userId);
    localStorage.setItem(jwtConfig.user.userIdName, meta.userId);
  }

  const permissions = JSON.stringify(meta.permissions || []);
  localStorage.setItem(jwtConfig.admin.permissionsName, permissions);
  localStorage.setItem(jwtConfig.user.permissionsName, permissions);
};

const readPermissions = (rawValue: string | null) => {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed.map((value) => String(value)).filter(Boolean);
    }
  } catch {
    return rawValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
};

export const getStoredAuthMetadata = (): AuthMetadata => {
  if (typeof window === "undefined") {
    return { permissions: [] };
  }

  return {
    token:
      localStorage.getItem(jwtConfig.admin.accessTokenName) ||
      localStorage.getItem(jwtConfig.user.accessTokenName) ||
      undefined,
    roleName:
      localStorage.getItem(jwtConfig.admin.roleName) ||
      localStorage.getItem(jwtConfig.user.roleName) ||
      undefined,
    roleId:
      localStorage.getItem(jwtConfig.admin.roleIdName) ||
      localStorage.getItem(jwtConfig.user.roleIdName) ||
      undefined,
    adminId: localStorage.getItem(jwtConfig.admin.adminIdName) || undefined,
    userId:
      localStorage.getItem(jwtConfig.admin.userIdName) ||
      localStorage.getItem(jwtConfig.user.userIdName) ||
      undefined,
    permissions: readPermissions(
      localStorage.getItem(jwtConfig.admin.permissionsName) ||
        localStorage.getItem(jwtConfig.user.permissionsName),
    ),
  };
};

export const isSuperAdmin = (meta?: Pick<AuthMetadata, "roleName" | "permissions"> | null) => {
  const roleName = String(meta?.roleName || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  return roleName === "super_admin";
};

export const hasPermission = (
  meta: Pick<AuthMetadata, "roleName" | "permissions"> | null | undefined,
  permission?: string,
) => {
  const normalizedPermission = normalizePermission(permission);
  if (!normalizedPermission) return true;
  if (isSuperAdmin(meta)) return true;

  const normalizedRole = String(meta?.roleName || "").toLowerCase();
  const permissions = meta?.permissions || [];
  const hasRecognizedPermissions = permissions.some(
    (item) => item === "*" || ALL_PERMISSION_KEYS.includes(item as PermissionKey),
  );

  if (
    permissions.includes(normalizedPermission) ||
    permissions.includes(permission || "") ||
    permissions.includes("*")
  ) {
    return true;
  }

  if (permissions.length === 0) {
    const legacyPermissions = Object.entries(LEGACY_ROLE_PERMISSION_MAP).find(
      ([role]) => normalizedRole.includes(role),
    )?.[1];

    if (
      legacyPermissions?.includes(normalizedPermission) ||
      legacyPermissions?.includes(permission || "")
    ) {
      return true;
    }
  }

  if (!hasRecognizedPermissions) {
    const legacyPermissions = Object.entries(LEGACY_ROLE_PERMISSION_MAP).find(
      ([role]) => normalizedRole.includes(role),
    )?.[1];

    if (
      legacyPermissions?.includes(normalizedPermission) ||
      legacyPermissions?.includes(permission || "")
    ) {
      return true;
    }
  }

  return false;
};

export const hasAnyPermission = (
  meta: Pick<AuthMetadata, "roleName" | "permissions"> | null | undefined,
  permissions: string[] = [],
) => {
  if (permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(meta, permission));
};

export const canAccessAdminDashboard = (
  meta: Pick<AuthMetadata, "roleName" | "permissions"> | null | undefined,
) => {
  if (isSuperAdmin(meta)) return true;
  const roleName = String(meta?.roleName || "").toLowerCase();
  if (roleName.includes("admin")) return true;
  const permissions = meta?.permissions || [];
  return permissions.some((permission) =>
    [
      "admin:",
      "role:",
      "whitelist:",
      "log:",
      "dashboard:",
      "client:",
      "client_key:",
      "available_payment:",
      "order:",
    ].some((prefix) => permission.startsWith(prefix)),
  );
};

export const getRoleLabel = (role?: Role | string | null) => {
  if (!role) return "-";
  if (typeof role === "string") return role;
  return role.name || "-";
};

const formatPermissionLabel = (permission: string) => {
  const [, action = permission] = permission.split(":");
  return action
    .split(/[_-]+/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const buildPermissionGroups = (
  permissions: string[] = [],
): PermissionGroup[] => {
  const dedupedPermissions = Array.from(
    new Set(permissions.map((permission) => normalizePermission(permission)).filter(Boolean)),
  );

  if (dedupedPermissions.length === 0) {
    return RBAC_PERMISSION_GROUPS;
  }

  const grouped = dedupedPermissions.reduce<Record<string, string[]>>(
    (acc, permission) => {
      const [resource = "other"] = permission.split(":");
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    },
    {},
  );

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([resource, resourcePermissions]) => ({
      key: resource,
      label:
        PERMISSION_GROUP_LABELS[resource] ||
        resource
          .split(/[_-]+/g)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      permissions: resourcePermissions
        .sort((left, right) => left.localeCompare(right))
        .map((permission) => ({
          key: permission as PermissionKey,
          label: formatPermissionLabel(permission),
        })),
    }));
};
