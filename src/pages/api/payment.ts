import { decryptData } from "@/utils/encryption";
import { NextApiRequest, NextApiResponse } from "next";

const orders = {}; // This should be replaced with a database or persistent storage

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: "No data provided" });
    }

    try {
      // Decrypt the order data
      const orderData = decryptData(Array.isArray(data) ? data[0] : data); // Implement decryptData function

      // Process the order data as needed
      // For example, render a payment page with the order data
      return res.status(200).json(orderData);
    } catch (error) {
      console.error("Decryption error:", error);
      return res.status(500).json({ error: "Failed to process order data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
