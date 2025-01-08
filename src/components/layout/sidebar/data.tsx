import {
  FcBarChart,
  FcCallback,
  FcFeedback,
  FcGenealogy,
  FcHome,
  FcNook,
  FcOrganization,
  FcPaid,
  FcPortraitMode,
  FcReading,
  FcSalesPerformance,
  FcSettings,
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
    ],
  },
  {
    title: "Settings",
    icon: <FcSettings />,
    link: "/dashboard/settings",
  },
];
