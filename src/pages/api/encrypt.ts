import { encryptData } from "@/utils/encryption";
import { NextApiRequest, NextApiResponse } from "next";

// Server-side encryption endpoint.
// The encryption/HMAC keys live only on the server (see encryption.ts); the
// browser never receives them. Clients POST a JSON payload and get back the
// encrypted `q` token used in payment URLs.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const data = req.body;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({ error: "No data provided" });
  }

  try {
    const q = encryptData(data);
    return res.status(200).json({ q });
  } catch (error) {
    console.error("Encryption error:", error);
    return res.status(500).json({ error: "Failed to encrypt data" });
  }
}
