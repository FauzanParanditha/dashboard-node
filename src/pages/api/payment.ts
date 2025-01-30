import { decryptData } from "@/utils/encryption";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { data } = req.query;
  if (!data) {
    return res.status(400).json({ error: "No data provided" });
  }

  try {
    // Decrypt the order data
    const orderData = decryptData(Array.isArray(data) ? data[0] : data);

    // Get the current timestamp
    const currentTime = new Date().getTime(); // Current time in milliseconds
    const expirationTime = new Date(orderData.expired * 1000).getTime(); // Convert UNIX timestamp to milliseconds

    if (currentTime > expirationTime) {
      return res.status(400).json({ error: "Order has expired" });
    }

    // Order is still valid, return it
    return res.status(200).json(orderData);
  } catch (error) {
    console.error("Decryption error:", error);
    return res.status(500).json({ error: "Failed to process order data" });
  }
}
