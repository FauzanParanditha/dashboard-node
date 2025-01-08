import useStore from "@/store";
import { getStatusColor } from "@/utils/helper";
import { CalendarOutlined } from "@ant-design/icons";
import { Badge, Card, List } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import OrdersSkeleton from "../skeleton/orders";
import { Text } from "../text";

const Orders = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(true);
  const { isLoading, setIsLoading } = useStore();
  const [error, setError] = useState<string | null>(null);

  const { data: orders, mutate: revalidate } = useSWR(
    `/api/v1/orders?limit=${5}&page=${page}&query=${search}`
  );

  useEffect(() => {
    if (orders !== undefined) {
      if (orders?.data?.length !== 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }
  }, [orders]);

  return (
    <Card
      style={{ height: "100%" }}
      styles={{ header: { padding: "8px 16px" }, body: { padding: "0 1rem" } }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CalendarOutlined />
          <Text size="sm" style={{ marginLeft: "0.7rem" }}>
            Orders
          </Text>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }).map((_, index) => ({
            id: index,
          }))}
          renderItem={() => <OrdersSkeleton />}
        ></List>
      ) : error ? (
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "220px",
          }}
        >
          {error}
        </span>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={orders?.data || []}
          renderItem={(item) => {
            const { orderId, paymentStatus, payer }: any = item;

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge color={getStatusColor(paymentStatus)} />}
                  title={
                    <Text size="xs" strong>
                      Order ID: {orderId}
                    </Text>
                  }
                  description={
                    <>
                      <Text>
                        Payer: <strong>{payer}</strong>
                      </Text>{" "}
                      <Text>
                        Status:{" "}
                        <strong
                          style={{
                            color: getStatusColor(paymentStatus),
                          }}
                        >
                          {paymentStatus}
                        </strong>
                      </Text>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
      {!isLoading && orders?.data.length === 0 && (
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "220px",
          }}
        >
          NO Orders
        </span>
      )}
    </Card>
  );
};

export default Orders;
