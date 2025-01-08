import Link from "next/link";
import { clsx } from "clsx";

type Props = {
  label?: string;
  className?: string;
  icon?: any;
  iconPlacement?: "left" | "right";
  iconClass?: string;
  white?: boolean;
  basic?: boolean;
  primary?: boolean;
  textClass?: string;
  danger?: boolean;
  success?: boolean;
  block?: boolean;
  medium?: boolean;
  outlineDanger?: boolean;
  outlineBasic?: boolean;
  bold?: boolean;
  to?: string;
  onClick?: () => void;
};

export default function Button({
  label,
  className = "",
  icon,
  iconPlacement = "left",
  iconClass = "",
  textClass = "",
  basic,
  white,
  primary,
  danger,
  success,
  outlineDanger,
  outlineBasic,
  block,
  medium,
  bold,
  to,
  onClick,
  ...rest
}: Props) {
  return to ? (
    <p className={clsx(block ? "w-full" : "inline-block")}>
      <Link href={to} {...rest}>
        <a
          className={clsx(
            "flex flex-row items-center justify-center space-x-2 px-3 py-2 group font-medium",
            basic ? "bg-[#F8F9FA] hover:bg-gray-300" : "",
            white ? "bg-white text-black hover:bg-primary-light" : "",
            primary ? "hover:bg-primary-light" : "",
            danger ? "bg-red-800 hover:bg-red-700" : "",
            success ? "bg-green-600 hover:bg-green-700" : "",
            outlineDanger
              ? "bg-white border border-primary hover:bg-primary"
              : "",
            outlineBasic ? "bg-white border hover:bg-gray-200" : "",
            className.includes("rounded") ? className : "rounded",
            className
          )}
        >
          {iconPlacement === "left" && icon && (
            <span
              className={clsx(
                "h-4 w-4",
                primary ? "text-red-800" : "",
                danger ? "text-white" : "",
                success ? "text-white" : "",
                outlineDanger ? "text-primary group-hover:text-white" : "",
                outlineBasic ? "text-black" : "",
                iconClass
              )}
            >
              {icon}
            </span>
          )}
          {label && (
            <span
              className={clsx(
                "inline-block text-center",
                primary ? "text-red-800" : "",
                danger ? "text-white" : "",
                success ? "text-white" : "",
                outlineDanger ? "text-primary group-hover:text-white" : "",
                outlineBasic ? "text-black" : "",
                medium ? "font-medium" : "",
                bold ? "font-bold" : "",
                textClass
              )}
            >
              {label}
            </span>
          )}
          {iconPlacement === "right" && icon && (
            <span
              className={clsx(
                "h-4 w-4",
                primary ? "text-red-800" : "",
                danger ? "text-white" : "",
                success ? "text-white" : "",
                outlineDanger ? "text-primary group-hover:text-white" : "",
                outlineBasic ? "text-black" : "",
                iconClass
              )}
            >
              {icon}
            </span>
          )}
        </a>
      </Link>
    </p>
  ) : (
    <button
      className={clsx(
        "flex flex-row items-center justify-center space-x-2 px-3 py-2 group",
        block ? "w-full" : "",
        basic ? "bg-[#F8F9FA] hover:bg-gray-300" : "",
        white ? "bg-white text-black hover:bg-red-500" : "",
        primary ? "hover:bg-red-500" : "",
        danger ? "bg-red-800 hover:bg-red-700" : "",
        success ? "bg-green-800 hover:bg-green-700" : "",
        outlineDanger
          ? "bg-white border border-primary hover:bg-primary text-primary"
          : "",
        outlineBasic ? "bg-white border hover:bg-gray-200" : "",
        className.includes("rounded") ? className : "rounded",
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {iconPlacement === "left" && icon && (
        <span
          className={clsx(
            "h-4 w-4",
            primary ? "text-red-800" : "",
            danger ? "text-white" : "",
            success ? "text-white" : "",
            outlineDanger ? "text-red-800 group-hover:text-white" : "",
            outlineBasic ? "text-black" : "",
            iconClass
          )}
        >
          {icon}
        </span>
      )}
      {label && (
        <span
          className={clsx(
            "inline-block text-center",
            primary ? "text-red-800" : "",
            danger ? "text-white" : "",
            success ? "text-white" : "",
            outlineDanger ? "text-red-800 group-hover:text-white" : "",
            outlineBasic ? "text-black" : "",
            medium ? "font-medium" : "",
            bold ? "font-bold" : "",
            textClass
          )}
        >
          {label}
        </span>
      )}
      {iconPlacement === "right" && icon && (
        <span
          className={clsx(
            "h-4 w-4",
            primary ? "text-red-800" : "",
            danger ? "text-white" : "",
            success ? "text-white" : "",
            outlineDanger ? "text-primary group-hover:text-white" : "",
            outlineBasic ? "text-black" : "",
            iconClass
          )}
        >
          {icon}
        </span>
      )}
    </button>
  );
}
