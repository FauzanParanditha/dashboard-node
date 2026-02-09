import { DashboardLayout } from "@/components/layout";
import { useAuthGuard } from "@/hooks/use-auth";
import { Col, Row } from "antd";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useState } from "react";
import { jwtConfig } from "@/utils/var";
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

  const isAdmin = String(role || "").toLowerCase().includes("admin");

  const { data: dashboard, mutate: revalidate } = useSWR(
    "/api/v1/adm/dashboard",
  );
  const [isLoading, setIsLoading] = useState(false);

  const DashboardTotalCountCard = dynamic(
    async () => await import("@/components/home/total-count"),
  );
  const Orders = dynamic(async () => await import("@/components/home/orders"));
  const DashboardLatestActivities = dynamic(
    async () => await import("@/components/home/latest-activities"),
  );

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
          {isAdmin && (
            <Col xs={24} sm={24} xl={8}>
              <DashboardTotalCountCard
                resource="client"
                isLoading={isLoading}
                totalCount={dashboard?.data.client}
              />
            </Col>
          )}
          {isAdmin && (
            <Col xs={24} sm={24} xl={8}>
              <DashboardTotalCountCard
                resource="user"
                isLoading={isLoading}
                totalCount={dashboard?.data.user}
              />
            </Col>
          )}
          <Col xs={24} sm={24} xl={8}>
            <DashboardTotalCountCard
              resource="order"
              isLoading={isLoading}
              totalCount={dashboard?.data.order}
            />
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginTop: "8px" }}>
          <Col xs={24} sm={24} xl={8} style={{ height: "540px" }}>
            <Orders />
          </Col>
          {isAdmin && (
            <Col xs={24} sm={24} xl={16} style={{ height: "460px" }}>
              <DashboardLatestActivities />
            </Col>
          )}
        </Row>
      </DashboardLayout>
    </>
  );
};

export default HomePage;
