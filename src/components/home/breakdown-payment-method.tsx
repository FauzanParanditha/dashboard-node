import { CreditCardOutlined } from "@ant-design/icons";
import { Card, List, Tag } from "antd";
import { Text } from "../text";

type PaymentMethodData = Array<{
  method: string;
  count: number;
  amount: number;
}>;

type Props = {
  data?: PaymentMethodData;
  isLoading: boolean;
};

const DashboardBreakdownPaymentMethod = ({ data, isLoading }: Props) => {
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
          <CreditCardOutlined />
          <Text
            size="sm"
            style={{ marginLeft: "0.5rem" }}
            className="dark:text-white"
          >
            By Payment Method
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
        renderItem={(item) => {
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
                    <Tag color="cyan" style={{ margin: 0 }}>
                      {item.method?.toUpperCase() || "UNKNOWN"}
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
                      ({item.count?.toLocaleString("id-ID")} Trx)
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

export default DashboardBreakdownPaymentMethod;
