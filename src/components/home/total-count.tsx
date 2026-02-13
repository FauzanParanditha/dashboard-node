import { variants } from "@/constant";
import { Card, Skeleton } from "antd";
import { Text } from "../text";

type Props = {
  resource:
    | "client"
    | "user"
    | "order"
    | "totalTransactionSuccess"
    | "totalAmountSuccess";
  isLoading: boolean;
  totalCount?: number;
};

const DashboardTotalCountCard = ({
  resource,
  isLoading,
  totalCount,
}: Props) => {
  const { primaryColor, secondaryColor, icon, title } = variants[resource];
  const formattedValue =
    resource === "totalAmountSuccess"
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
          whiteSpace: "nowrap",
        }}
      >
        {icon}
        <Text
          size="md"
          className="secondary dark:text-white"
          style={{ marginLeft: "8px" }}
        >
          {title}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text
          size="xxxl"
          strong
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            flexShrink: 0,
            textAlign: "start",
            marginLeft: "48px",
            fontVariantNumeric: "tabular-nums",
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
