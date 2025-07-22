import { decryptData } from "@/utils/encryption";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "No data provided" });
  }

  try {
    // Decrypt the order data
    const orderData = decryptData(
      decodeURIComponent(Array.isArray(q) ? q[0] : q),
    );

    // Get the current timestamp
    dayjs.extend(customParseFormat);

    const currentTime = dayjs().unix();

    let paymentExpiredStr = orderData?.paymentData?.paymentExpired
      ? orderData?.paymentData?.paymentExpired
      : orderData?.expired;
    let paymentExpired;

    if (typeof paymentExpiredStr !== "string") {
      paymentExpiredStr = String(paymentExpiredStr);
    }

    // Cek apakah nilai adalah angka 10 digit (Unix timestamp dalam detik)
    if (/^\d{10}$/.test(paymentExpiredStr)) {
      paymentExpired = Number(paymentExpiredStr); // Langsung pakai sebagai epoch time
    } else if (paymentExpiredStr.includes("T")) {
      // Format ISO 8601
      paymentExpired = dayjs(paymentExpiredStr).unix();
    } else {
      // Format YYYYMMDDHHmmss
      paymentExpired = dayjs(paymentExpiredStr, "YYYYMMDDHHmmss").unix();
    }

    // Validasi hasil konversi
    if (!paymentExpired || isNaN(paymentExpired)) {
      return res
        .status(400)
        .json({ error: "Invalid payment expiration format" });
    }

    if (currentTime > paymentExpired) {
      return res.status(410).json({ error: "Order has expired" });
    }

    // Order is still valid, return it
    return res.status(200).json(orderData);
  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(500).json({ error: "Failed to process order data" });
  }
}
