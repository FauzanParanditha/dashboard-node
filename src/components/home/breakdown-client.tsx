import { TeamOutlined } from "@ant-design/icons";
import { Avatar, Card, List } from "antd";
import { Text } from "../text";

type ClientData = Array<{ clientId: string; count: number; amount: number }>;

type Props = {
  data?: ClientData;
  isLoading: boolean;
};

const DashboardBreakdownClient = ({ data, isLoading }: Props) => {
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
          <TeamOutlined />
          <Text
            size="sm"
            style={{ marginLeft: "0.5rem" }}
            className="dark:text-white"
          >
            Top Clients
          </Text>
        </div>
      }
      className="dark:bg-black"
      style={{ height: "100%" }}
    >
      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={data || []}
        locale={{ emptyText: "No data" }}
        renderItem={(item, index) => {
          return (
            <List.Item style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: "12px",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <Avatar
                    style={{
                      backgroundColor: [
                        "#1677FF",
                        "#FA8C16",
                        "#52C41A",
                        "#EB2F96",
                        "#2F54EB",
                        "#13C2C2",
                        "#722ED1",
                        "#FA541C",
                      ][index % 8],
                    }}
                  >
                    {item.clientId?.charAt(0).toUpperCase() || "?"}
                  </Avatar>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      minWidth: 0,
                    }}
                  >
                    <Text
                      className="dark:text-white"
                      strong
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.clientId}
                    </Text>
                    <Text
                      className="dark:text-gray-400"
                      size="sm"
                      style={{
                        margin: 0,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ({item.count?.toLocaleString("id-ID")} Orders)
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
                    }).format(item.amount || 0)}
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

export default DashboardBreakdownClient;
