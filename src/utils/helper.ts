export const classNames = (...classes: any) => {
  return classes.filter(Boolean).join(" ");
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "green";
    case "pending":
      return "orange";
    case "failed":
      return "red";
    default:
      return "gray";
  }
};

export const getStatusResponseColor = (status: number) => {
  if (status >= 200 && status < 300) {
    return "green";
  } else if (status >= 400 && status < 500) {
    return "yellow";
  } else if (status >= 500 && status < 600) {
    return "red";
  } else {
    return "gray"; // default
  }
};

export default function formatMoney(number: any) {
  let ret = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
  return ret;
}

export const formatRupiah = (value: any): string => {
  if (isNaN(value)) return "Rp.0";
  const num = Number(value);
  return `Rp.${num.toLocaleString("id-ID")}`;
};

export const getNameInitials = (name: string, count = 2) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  const filtered = initials.replace(/[^a-zA-Z]/g, "");
  return filtered.slice(0, count).toUpperCase();
};
