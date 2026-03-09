import { variants } from "@/constant";
import { Card, Select, Skeleton } from "antd";
import { useState } from "react";
import { Text } from "../text";

type ResourceType =
  | "client"
  | "user"
  | "order"
  | "totalTransactionSuccess"
  | "totalAmountSuccess"
  | "totalRealAmountSuccess";

type Props = {
  resources?: {
    resource: ResourceType;
    totalCount?: number;
  }[];
  // Kept for backward compatibility
  resource?: ResourceType;
  totalCount?: number;
  isLoading: boolean;
  status?: string;
  setStatus?: (status: string | undefined) => void;
};

const DashboardTotalCountCard = ({
  resources: propResources,
  resource: propResource,
  isLoading,
  totalCount: propTotalCount,
  status,
  setStatus,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const resources =
    propResources ||
    (propResource
      ? [{ resource: propResource, totalCount: propTotalCount }]
      : []);

  const currentItem = resources[activeIndex] || resources[0];
  if (!currentItem) return null;

  const { resource, totalCount } = currentItem;
  const { primaryColor, secondaryColor, icon, title } = variants[resource];

  const getDisplayTitle = (res: ResourceType) => {
    const t = variants[res].title;
    if (!status) return t;

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    if (res === "totalTransactionSuccess") {
      return `Total Transaction ${capitalizedStatus}`;
    }
    if (res === "totalAmountSuccess") {
      return `Total Amount ${capitalizedStatus}`;
    }
    if (res === "totalRealAmountSuccess") {
      return `Total Real Amount ${capitalizedStatus}`;
    }
    return t;
  };

  const displayTitle = getDisplayTitle(resource);

  const formattedValue =
    resource === "totalAmountSuccess" || resource === "totalRealAmountSuccess"
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(totalCount || 0)
      : (totalCount || 0).toLocaleString("id-ID");

  return (
    <Card
      style={{ height: "96px", padding: 0 }}
      styles={{ body: { padding: "8px 8px 8px 12px" } }}
      size="small"
      className="dark:bg-black"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
        }}
      >
        <div style={{ flexShrink: 0 }}>{icon}</div>
        {resources.length > 1 ? (
          <Select
            value={activeIndex}
            onChange={setActiveIndex}
            variant="borderless"
            className="dark:text-white"
            style={{ marginLeft: "0px", minWidth: "160px" }}
            dropdownStyle={{ minWidth: 220 }}
            options={resources.map((r, i) => ({
              label: (
                <Text size="md" className="secondary dark:text-white">
                  {getDisplayTitle(r.resource)}
                </Text>
              ),
              value: i,
            }))}
          />
        ) : (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Text
              size="md"
              className="secondary dark:text-white"
              style={{ marginLeft: "8px" }}
            >
              {displayTitle}
            </Text>
          </div>
        )}
        {setStatus && (
          <Select
            allowClear
            variant="borderless"
            placeholder="Filter by Status"
            value={status || undefined}
            onChange={setStatus}
            style={{ minWidth: 120, marginLeft: "auto", fontSize: "12px" }}
            dropdownStyle={{ minWidth: 140 }}
            className="dark:text-white"
            options={[
              { label: "Pending", value: "pending" },
              { label: "Paid", value: "paid" },
              { label: "Failed", value: "failed" },
              { label: "Cancel", value: "cancel" },
              { label: "Expired", value: "expired" },
            ]}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text
          strong
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "start",
            marginLeft: "48px",
            fontVariantNumeric: "tabular-nums",
            fontSize:
              resource === "totalAmountSuccess" ||
              resource === "totalRealAmountSuccess"
                ? "clamp(18px, 4vw, 24px)"
                : "clamp(24px, 5vw, 30px)",
            lineHeight: 1.2,
          }}
          className="dark:text-white"
        >
          {isLoading ? (
            <Skeleton.Button style={{ marginTop: "8px", width: "74px" }} />
          ) : (
            formattedValue
          )}
        </Text>
      </div>
    </Card>
  );
};

export default DashboardTotalCountCard;
