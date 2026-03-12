import type { ReactNode } from "react";
import {
  FcBarChart,
  FcCallback,
  FcFeedback,
  FcGenealogy,
  FcHome,
  FcKey,
  FcNook,
  FcOrganization,
  FcPaid,
  FcPortraitMode,
  FcReading,
  FcSalesPerformance,
  FcSettings,
  FcSupport,
  FcSynchronize,
} from "react-icons/fc";

export type SidebarSubItem = {
  title: string;
  icon: ReactNode;
  link: string;
  requiredPermissions?: string[];
};

export type SidebarItem = {
  title: string;
  icon: ReactNode;
  link: string;
  requiredPermissions?: string[];
  subMenu?: SidebarSubItem[];
};

export const dashboardSidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: <FcHome />,
    link: "/dashboard/home",
    requiredPermissions: ["dashboard:view"],
  },
  {
    title: "IP",
    icon: <FcGenealogy />,
    link: "/dashboard/ip",
    requiredPermissions: ["whitelist:list"],
  },
  {
    title: "Available Payment",
    icon: <FcSalesPerformance />,
    link: "/dashboard/available-payment",
    requiredPermissions: [
      "available_payment:create",
      "available_payment:update",
    ],
  },
  {
    title: "Role",
    icon: <FcSupport />,
    link: "/dashboard/role",
    requiredPermissions: ["role:list", "role:read"],
  },
  {
    title: "Admin",
    icon: <FcPortraitMode />,
    link: "/dashboard/admin",
    requiredPermissions: ["admin:list", "admin:read"],
  },
  {
    title: "User",
    icon: <FcReading />,
    link: "/dashboard/user",
    requiredPermissions: ["user:list", "user:read"],
  },
  {
    title: "Client",
    icon: <FcOrganization />,
    link: "/dashboard/client",
    requiredPermissions: ["client:list", "client:read"],
  },
  {
    title: "Client Key",
    icon: <FcKey />,
    link: "/dashboard/client-key",
    requiredPermissions: ["client_key:list", "client_key:read"],
  },
  {
    title: "Order",
    icon: <FcPaid />,
    link: "/dashboard/order",
    requiredPermissions: ["order:list", "order:read"],
  },
  {
    title: "Logs",
    icon: <FcNook />,
    link: "#",
    subMenu: [
      {
        title: "Activity Logs",
        icon: <FcBarChart />,
        link: "/dashboard/logs/activity",
        requiredPermissions: ["log:activity"],
      },
      {
        title: "API Logs",
        icon: <FcSynchronize />,
        link: "/dashboard/logs/apilogs",
        requiredPermissions: ["log:api"],
      },
      {
        title: "Email Logs",
        icon: <FcFeedback />,
        link: "/dashboard/logs/email",
        requiredPermissions: ["log:email"],
      },
      {
        title: "Callback Logs",
        icon: <FcCallback />,
        link: "/dashboard/logs/callback",
        requiredPermissions: ["log:callback"],
      },
      {
        title: "Failed Callback Logs",
        icon: <FcSynchronize />,
        link: "/dashboard/logs/failed-callback",
        requiredPermissions: ["log:retry"],
      },
    ],
  },
  {
    title: "Settings",
    icon: <FcSettings />,
    link: "/dashboard/settings",
  },
];
