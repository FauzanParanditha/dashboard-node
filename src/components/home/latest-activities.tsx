import CustomAvatar from "@/components/custom-avatar";
import useStore from "@/store";
import { getStatusResponseColor } from "@/utils/helper";
import { UnorderedListOutlined } from "@ant-design/icons";
import { Card, List } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import useSWR from "swr";
import LatestActivitiesSkeleton from "../skeleton/latest-activities";
import { Text } from "../text";

const DashboardLatestActivities = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { isLoading, setIsLoading } = useStore();
  const [error, setError] = useState<string | null>(null);

  const { data: apilogs, mutate: revalidate } = useSWR(
    `/api/v1/adm/apilogs?limit=${5}&page=${page}&query=${search}`
  );

  return (
    <Card
      styles={{
        header: { padding: "16px" },
        body: {
          padding: "0 1rem",
        },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginLeft: "0.5rem" }}>
            Latest Activities
          </Text>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }).map((_, i) => ({
            id: i,
          }))}
          renderItem={(_, index) => <LatestActivitiesSkeleton key={index} />}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={apilogs?.data || []}
          renderItem={(item) => {
            const { endpoint, ipAddress, method, statusCode, createdAt }: any =
              item;

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <CustomAvatar
                      status={statusCode}
                      shape="square"
                      size={72}
                      style={{
                        backgroundColor: `${getStatusResponseColor(
                          statusCode
                        )}`,
                      }}
                    />
                  }
                  title={dayjs(createdAt).format("MMM DD, YYYY-HH:mm")}
                  description={
                    <>
                      <Text>
                        Endpoint :{" "}
                        <strong>
                          {method}:&quot;{endpoint}&quot;
                        </strong>
                      </Text>
                      <br />
                      <Text>
                        Ip : <strong>{ipAddress}</strong>
                      </Text>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default DashboardLatestActivities;
