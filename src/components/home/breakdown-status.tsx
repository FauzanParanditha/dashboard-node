import { getStatusColor } from "@/utils/helper";
import { PieChartOutlined } from "@ant-design/icons";
import { Card, List, Tag } from "antd";
import { Text } from "../text";

type StatusData = Record<string, { count: number; amount: number }>;

type Props = {
  data?: StatusData;
  isLoading: boolean;
};

const DashboardBreakdownStatus = ({ data, isLoading }: Props) => {
  const statusEntries = data ? Object.entries(data) : [];

  return (
    <Card
      styles={{
        header: { padding: "16px" },
        body: {
          padding: 0,
        },
      }}
      title={
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          className="dark:text-white"
        >
          <PieChartOutlined />
          <Text
            size="sm"
            style={{ marginLeft: "0.5rem" }}
            className="dark:text-white"
          >
            By Status
          </Text>
        </div>
      }
      className="dark:bg-black"
      style={{ height: "100%" }}
    >
      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={statusEntries.length > 0 ? statusEntries : []}
        locale={{ emptyText: "No data" }}
        renderItem={([status, info]) => {
          return (
            <List.Item style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Tag
                      color={getStatusColor(status?.toLowerCase())}
                      style={{ margin: 0 }}
                    >
                      {status?.toUpperCase()}
                    </Tag>
                    <Text
                      className="dark:text-gray-400"
                      size="sm"
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ({info.count?.toLocaleString("id-ID")} Trx)
                    </Text>
                  </div>
                  <Text
                    className="dark:text-white"
                    strong
                    style={{ margin: 0, lineHeight: 1.2, whiteSpace: "nowrap" }}
                  >
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(info.amount || 0)}
                  </Text>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default DashboardBreakdownStatus;
