import { DashboardLayout } from "@/components/layout";
import { Text } from "@/components/text";
import { useRBAC } from "@/hooks/use-rbac";
import { useAuthGuard } from "@/hooks/use-auth";
import { Card, Col, DatePicker, Row, Segmented, Select, Space } from "antd";
import { Dayjs } from "dayjs";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const { RangePicker } = DatePicker;

const HomePage = () => {
  useAuthGuard(["dashboard:read"]);
  const { hasAnyPermission } = useRBAC();
  const [isMounted, setIsMounted] = useState(false);
  const canFilterClient =
    isMounted && hasAnyPermission(["client:list", "order:list"]);
  const canViewClientMetrics =
    isMounted && hasAnyPermission(["client:list", "client:read"]);
  const canViewUserMetrics =
    isMounted && hasAnyPermission(["user:list", "user:read"]);
  const canViewLatestActivities =
    isMounted && hasAnyPermission(["logs:activity"]);
  const showRightSidebar = canFilterClient || canViewLatestActivities;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Global Dashboard Filters
  const [period, setPeriod] = useState<string>("last_month");
  const [customRange, setCustomRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Chart Filters (lifted up from performance-chart)
  const [chartPeriod, setChartPeriod] = useState<string>("month");
  const [groupBy, setGroupBy] = useState<"time" | "client">("time");

  const { data: clientsResponse, isLoading: isClientsLoading } = useSWR(
    canFilterClient ? "/api/v1/client" : null,
  );
  const clients: any[] = clientsResponse?.data || [];

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    if (
      period === "custom" &&
      customRange &&
      customRange[0] &&
      customRange[1]
    ) {
      params.set("startDate", customRange[0].format("YYYY-MM-DD"));
      params.set("endDate", customRange[1].format("YYYY-MM-DD"));
    }
    if (clientId) params.set("clientId", clientId);
    if (status) params.set("status", status);

    // No need for separate chartPeriod/chartDate parameters
    params.set("groupBy", groupBy);

    return `/api/v1/adm/dashboard?${params.toString()}`;
  }, [period, customRange, clientId, status, groupBy]);

  const { data: response, isLoading } = useSWR(endpoint);
  const dashboard = response?.data;

  const DashboardTotalCountCard = dynamic(
    async () => await import("@/components/home/total-count"),
  );
  const DashboardLatestActivities = dynamic(
    async () => await import("@/components/home/latest-activities"),
  );
  const DashboardPerformanceChart = dynamic(
    async () => await import("@/components/home/performance-chart"),
  );
  const DashboardBreakdownStatus = dynamic(
    async () => await import("@/components/home/breakdown-status"),
  );
  const DashboardBreakdownPaymentMethod = dynamic(
    async () => await import("@/components/home/breakdown-payment-method"),
  );
  const DashboardBreakdownClient = dynamic(
    async () => await import("@/components/home/breakdown-client"),
  );

  const metrics = canViewClientMetrics || canViewUserMetrics
    ? [
        {
          id: "client",
          xl: 8,
          resources: [
            { resource: "client" as const, totalCount: dashboard?.client },
          ],
        },
        {
          id: "user",
          xl: 8,
          resources: [
            { resource: "user" as const, totalCount: dashboard?.user },
          ],
        },
        {
          id: "order",
          xl: 8,
          resources: [
            { resource: "order" as const, totalCount: dashboard?.order },
          ],
        },
        {
          id: "totalTransactionSuccess",
          xl: 12,
          resources: [
            {
              resource: "totalTransactionSuccess" as const,
              totalCount: dashboard?.totalTransactionSuccess,
            },
          ],
        },
        {
          id: "amountGroup",
          xl: 12,
          resources: [
            {
              resource: "totalAmountSuccess" as const,
              totalCount: dashboard?.totalAmountSuccess,
            },
            {
              resource: "totalRealAmountSuccess" as const,
              totalCount: dashboard?.totalRealAmountSuccess,
            },
          ],
        },
      ]
    : [
        {
          id: "order",
          xl: 8,
          resources: [
            { resource: "order" as const, totalCount: dashboard?.order },
          ],
        },
        {
          id: "totalTransactionSuccess",
          xl: 8,
          resources: [
            {
              resource: "totalTransactionSuccess" as const,
              totalCount: dashboard?.totalTransactionSuccess,
            },
          ],
        },
        {
          id: "amountGroup",
          xl: 8,
          resources: [
            {
              resource: "totalAmountSuccess" as const,
              totalCount: dashboard?.totalAmountSuccess,
            },
            {
              resource: "totalRealAmountSuccess" as const,
              totalCount: dashboard?.totalRealAmountSuccess,
            },
          ],
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
        {/* Global Filter Bar */}
        <Card
          className="dark:bg-black"
          style={{ marginBottom: "16px" }}
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <Text
                strong
                className="dark:text-white"
                style={{ whiteSpace: "nowrap" }}
              >
                Dashboard Filters:
              </Text>
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <Segmented
                  options={[
                    { label: "Last Week", value: "last_week" },
                    { label: "Last Month", value: "last_month" },
                    { label: "Last 3 Months", value: "last_3_months" },
                    { label: "Custom", value: "custom" },
                  ]}
                  value={period}
                  onChange={(val) => setPeriod(val as string)}
                />
              </div>
              {period === "custom" && (
                <RangePicker
                  value={customRange as any}
                  onChange={(dates) => setCustomRange(dates as any)}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  style={{
                    touchAction: "manipulation",
                    flex: "1 1 auto",
                    minWidth: "240px",
                  }}
                />
              )}
            </div>

            <Space wrap style={{ width: "100%", justifyContent: "flex-start" }}>
              {canFilterClient && (
                <Select
                  showSearch
                  allowClear
                  placeholder="Filter by Client"
                  optionFilterProp="label"
                  loading={isClientsLoading}
                  value={clientId}
                  onChange={setClientId}
                  className="dashboard-filter-select"
                  style={{
                    width: "100%",
                    minWidth: "180px",
                    maxWidth: "400px",
                  }}
                  options={clients.map((client) => ({
                    value: client.clientId,
                    label: `${client.name} (${client.clientId})`,
                  }))}
                />
              )}
            </Space>
          </div>
        </Card>

        {/* Summary Cards */}
        <Row gutter={[8, 8]}>
          {metrics.map((metric) => (
            <Col key={metric.id} xs={24} sm={12} xl={metric.xl}>
              <DashboardTotalCountCard
                resources={metric.resources}
                isLoading={isLoading}
                status={status}
                setStatus={
                  metric.id === "totalTransactionSuccess" ||
                  metric.id === "amountGroup"
                    ? setStatus
                    : undefined
                }
              />
            </Col>
          ))}
        </Row>

        {/* Charts and Data Breakdowns */}
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          {/* Main 66% Column */}
          <Col xs={24} xl={showRightSidebar ? 16 : 24}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <DashboardPerformanceChart
                  chartData={dashboard?.chart}
                  isLoading={isLoading}
                  groupBy={groupBy}
                  setGroupBy={setGroupBy}
                  canFilterClient={canFilterClient}
                  status={status}
                />
              </Col>

              <Col xs={24} sm={12}>
                <DashboardBreakdownStatus
                  data={dashboard?.byStatus}
                  isLoading={isLoading}
                />
              </Col>

              <Col xs={24} sm={12}>
                <DashboardBreakdownPaymentMethod
                  data={dashboard?.byPaymentMethod}
                  isLoading={isLoading}
                />
              </Col>
            </Row>
          </Col>

          {/* Right sidebar 33% Column */}
          {showRightSidebar && (
            <Col xs={24} xl={8}>
              <Row gutter={[16, 16]}>
                {canFilterClient && (
                  <Col xs={24}>
                    <DashboardBreakdownClient
                      data={dashboard?.byClient}
                      isLoading={isLoading}
                    />
                  </Col>
                )}
                {canViewLatestActivities && (
                  <Col xs={24}>
                    <div style={{ height: canFilterClient ? "auto" : "100%" }}>
                      <DashboardLatestActivities />
                    </div>
                  </Col>
                )}
              </Row>
            </Col>
          )}
        </Row>
      </DashboardLayout>
    </>
  );
};

export default HomePage;
