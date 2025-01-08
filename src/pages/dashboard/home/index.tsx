import DashboardLatestActivities from "@/components/home/latest-activities";
import Orders from "@/components/home/orders";
import DashboardTotalCountCard from "@/components/home/total-count";
import { DashboardLayout } from "@/components/layout";
import { Col, Row } from "antd";
import Head from "next/head";
import { useState } from "react";
import useSWR from "swr";

const HomePage = () => {
  const { data: dashboard, mutate: revalidate } = useSWR(
    "/api/v1/adm/dashboard"
  );
  const [isLoading, setIsLoading] = useState(false);

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
          <Col xs={24} sm={24} xl={8}>
            <DashboardTotalCountCard
              resource="client"
              isLoading={isLoading}
              totalCount={dashboard?.data.client}
            />
          </Col>
          <Col xs={24} sm={24} xl={8}>
            <DashboardTotalCountCard
              resource="user"
              isLoading={isLoading}
              totalCount={dashboard?.data.user}
            />
          </Col>
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
          <Col xs={24} sm={24} xl={16} style={{ height: "460px" }}>
            <DashboardLatestActivities />
          </Col>
        </Row>
      </DashboardLayout>
    </>
  );
};

export default HomePage;
