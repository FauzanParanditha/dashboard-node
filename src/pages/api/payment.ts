import { decryptData } from "@/utils/encryption";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!process.env.ENCRYPTION_KEY) {
    console.error("Encryption key is missing.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const { q } = req.query;
  if (!q || (typeof q !== "string" && !Array.isArray(q))) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const queryString = Array.isArray(q) ? q[0] : q;
  if (
    !queryString ||
    typeof queryString !== "string" ||
    queryString.trim() === ""
  ) {
    return res.status(400).json({ error: "No data provided" });
  }

  let orderData;
  try {
    orderData = decryptData(queryString);
  } catch {
    console.error("Decryption error: Invalid data format");
    return res.status(400).json({ error: "Invalid or corrupted data" });
  }

  if (!Number.isFinite(orderData.expired) || orderData.expired <= 0) {
    return res.status(400).json({ error: "Invalid expiration data" });
  }

  const currentTime = Date.now();
  const expirationTime = orderData.expired * 1000;

  if (currentTime > expirationTime) {
    return res.status(400).json({ error: "Order has expired" });
  }

  return res.status(200).json(orderData);
}
