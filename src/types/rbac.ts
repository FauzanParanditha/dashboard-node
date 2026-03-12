export type PermissionKey =
  | "dashboard:view"
  | "dashboard:view_real_amount"
  | "whitelist:list"
  | "whitelist:read"
  | "whitelist:create"
  | "whitelist:update"
  | "whitelist:delete"
  | "available_payment:create"
  | "available_payment:update"
  | "available_payment:delete"
  | "admin:list"
  | "admin:read"
  | "admin:create"
  | "admin:update"
  | "admin:delete"
  | "role:list"
  | "role:read"
  | "role:create"
  | "role:update"
  | "role:delete"
  | "user:list"
  | "user:read"
  | "user:create"
  | "user:update"
  | "user:delete"
  | "client:list"
  | "client:read"
  | "client:create"
  | "client:update"
  | "client:delete"
  | "client_key:list"
  | "client_key:read"
  | "client_key:create"
  | "client_key:update"
  | "client_key:delete"
  | "order:list"
  | "order:read"
  | "order:update"
  | "order:export"
  | "category:create"
  | "category:update"
  | "category:delete"
  | "log:activity"
  | "log:api"
  | "log:email"
  | "log:callback"
  | "log:retry";

export type Role = {
  _id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[] | string[];
  createdAt?: string;
  updatedAt?: string;
};

export type AuthMetadata = {
  token?: string;
  roleId?: string;
  roleName?: string;
  permissions: string[];
  adminId?: string;
  userId?: string;
};

export type AdminWithRole = {
  _id: string;
  fullName: string;
  email: string;
  verified?: boolean;
  role?: Role | null;
  roleId?: Role | string | null;
};

export type PermissionGroup = {
  key: string;
  label: string;
  permissions: {
    key: PermissionKey;
    label: string;
    description?: string;
  }[];
};
