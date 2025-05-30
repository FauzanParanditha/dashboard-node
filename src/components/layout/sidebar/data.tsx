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
  FcSynchronize,
} from "react-icons/fc";

export const admin = [
  {
    title: "Dashboard",
    icon: <FcHome />,
    link: "/dashboard/home",
  },
  {
    title: "IP",
    icon: <FcGenealogy />,
    link: "/dashboard/ip",
  },
  {
    title: "Available Payment",
    icon: <FcSalesPerformance />,
    link: "/dashboard/available-payment",
  },
  {
    title: "Admin",
    icon: <FcPortraitMode />,
    link: "/dashboard/admin",
  },
  {
    title: "User",
    icon: <FcReading />,
    link: "/dashboard/user",
  },
  {
    title: "Client",
    icon: <FcOrganization />,
    link: "/dashboard/client",
  },
  {
    title: "Client Key",
    icon: <FcKey />,
    link: "/dashboard/client-key",
  },
  {
    title: "Order",
    icon: <FcPaid />,
    link: "/dashboard/order",
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
      },
      {
        title: "Email Logs",
        icon: <FcFeedback />,
        link: "/dashboard/logs/email",
      },
      {
        title: "Callback Logs",
        icon: <FcCallback />,
        link: "/dashboard/logs/callback",
      },
      {
        title: "Failed Callback Logs",
        icon: <FcSynchronize />,
        link: "/dashboard/logs/failed-callback",
      },
    ],
  },
  {
    title: "Settings",
    icon: <FcSettings />,
    link: "/dashboard/settings",
  },
];
