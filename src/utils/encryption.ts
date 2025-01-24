// utils/encryption.ts
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string,
  "hex",
);

if (!key || key.length !== 32) {
  throw new Error("NEXT_PUBLIC_ENCRYPTION_KEY must be a 32-byte key.");
}

export const encryptData = (data: Record<string, any>): string => {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  // Return IV and encrypted data together
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptData = (data: string): Record<string, any> => {
  const [ivHex, encryptedData] = data.split(":");
  const iv = Buffer.from(ivHex, "hex"); // Convert IV back to buffer
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};
