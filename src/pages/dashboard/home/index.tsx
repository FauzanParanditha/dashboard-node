import { DashboardLayout } from "@/components/layout";
import { useAuthGuard } from "@/hooks/use-auth";
import { jwtConfig } from "@/utils/var";
import { Col, Row } from "antd";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSWR from "swr";

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   // Use the checkAuth function to handle authentication
//   return checkAuthAdmin(context);
// };

const HomePage = () => {
  useAuthGuard();
  const [role, setRole] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole =
      localStorage.getItem(jwtConfig.admin.roleName) ||
      localStorage.getItem(jwtConfig.user.roleName) ||
      "";
    setRole(storedRole);
  }, []);

  const isAdmin = String(role || "")
    .toLowerCase()
    .includes("admin");

  const { data: dashboard, isLoading } = useSWR("/api/v1/adm/dashboard");
  const DashboardTotalCountCard = dynamic(
    async () => await import("@/components/home/total-count"),
  );
  const DashboardLatestActivities = dynamic(
    async () => await import("@/components/home/latest-activities"),
  );
  const DashboardPerformanceChart = dynamic(
    async () => await import("@/components/home/performance-chart"),
  );
  const metrics = isAdmin
    ? [
        { resource: "client" as const, value: dashboard?.data.client },
        { resource: "user" as const, value: dashboard?.data.user },
        { resource: "order" as const, value: dashboard?.data.order },
        {
          resource: "totalTransactionSuccess" as const,
          value: dashboard?.data.totalTransactionSuccess,
        },
        {
          resource: "totalAmountSuccess" as const,
          value: dashboard?.data.totalAmountSuccess,
        },
      ]
    : [
        { resource: "order" as const, value: dashboard?.data.order },
        {
          resource: "totalTransactionSuccess" as const,
          value: dashboard?.data.totalTransactionSuccess,
        },
        {
          resource: "totalAmountSuccess" as const,
          value: dashboard?.data.totalAmountSuccess,
        },
      ];

  return (
    <>
      <Head>
        <title>Dashboard Page</title>
        <meta
          name="description"
          content="Welcome to the dashboard page of My Next.js App!"
        />
      </Head>
      <DashboardLayout>
        <Row gutter={[8, 8]}>
          {metrics.map((metric) => (
            <Col key={metric.resource} xs={24} sm={12} xl={8}>
              <DashboardTotalCountCard
                resource={metric.resource}
                isLoading={isLoading}
                totalCount={metric.value}
              />
            </Col>
          ))}
        </Row>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} xl={24}>
            <DashboardPerformanceChart />
          </Col>
        </Row>
        {isAdmin && (
          <Row gutter={[8, 8]} style={{ marginTop: "8px" }}>
            <Col xs={24} sm={24} xl={24} style={{ height: "460px" }}>
              <DashboardLatestActivities />
            </Col>
          </Row>
        )}
      </DashboardLayout>
    </>
  );
};

export default HomePage;
