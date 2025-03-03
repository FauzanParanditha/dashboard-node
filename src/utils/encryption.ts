// utils/encryption.ts
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const encryptionKey = process.env.ENCRYPTION_KEY || "";
if (!encryptionKey) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables.");
}

if (encryptionKey.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte (64 hex character) key.");
}

const key = Buffer.from(encryptionKey, "hex");

if (!key || key.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte key.");
}

export const encryptData = (data: Record<string, any>): string => {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");
  // Return IV and encrypted data together
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptData = (data: string): Record<string, any> => {
  try {
    const [ivHex, encryptedData] = data.split(":");
    if (!ivHex || !encryptedData) throw new Error("Invalid encrypted format.");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data.");
  }
};
