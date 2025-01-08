import { getNameInitials } from "@/utils/helper";
import { Avatar as AntdAvatar, AvatarProps } from "antd";

type Props = AvatarProps & {
  name?: string;
  status?: number;
};

const CustomAvatar = ({ name, style, status, ...rest }: Props) => {
  return (
    <AntdAvatar
      alt={name}
      size={"small"}
      style={{
        backgroundColor: "#87d068",
        display: "flex",
        alignItems: "center",
        border: "none",
        ...style,
      }}
      {...rest}
    >
      {status ? <>{status}</> : <>{getNameInitials(name || "")}</>}
    </AntdAvatar>
  );
};

export default CustomAvatar;
