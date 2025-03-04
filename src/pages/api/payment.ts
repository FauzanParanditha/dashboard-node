import { decryptData } from "@/utils/encryption";
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
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > orderData.expired) {
      return res.status(400).json({ error: "Order has expired" });
    }

    // Order is still valid, return it
    return res.status(200).json(orderData);
  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(500).json({ error: "Failed to process order data" });
  }
}
