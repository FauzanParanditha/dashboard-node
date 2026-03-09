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

  const { data: activitylogs, mutate: revalidate } = useSWR(
    `/api/v1/adm/activitylogs?limit=${5}&page=${page}&query=${search}`,
  );

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
          <UnorderedListOutlined />
          <Text
            size="sm"
            style={{ marginLeft: "0.5rem" }}
            className="dark:text-white"
          >
            Latest Activities
          </Text>
        </div>
      }
      className="dark:bg-black"
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
          dataSource={activitylogs?.data || []}
          renderItem={(item) => {
            const { action, role, ipAddress, createdAt }: any = item;

            return (
              <List.Item style={{ padding: "16px" }}>
                <List.Item.Meta
                  avatar={
                    <CustomAvatar
                      status={200}
                      shape="square"
                      size={42}
                      style={{
                        backgroundColor: `${getStatusResponseColor(200)}`,
                        borderRadius: "8px",
                      }}
                    />
                  }
                  title={
                    <div className="dark:text-white">
                      {dayjs(createdAt).format("MMM DD, YYYY-HH:mm")}
                    </div>
                  }
                  description={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        marginTop: "4px",
                      }}
                    >
                      <Text className="dark:text-white" size="sm">
                        Action: <strong>{action}</strong>
                      </Text>
                      <Text className="dark:text-gray-400" size="xs">
                        Role: {role} | IP: {ipAddress}
                      </Text>
                    </div>
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
