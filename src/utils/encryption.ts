import crypto from "crypto";

const algorithm = "aes-256-cbc";
const encryptionKey = process.env.ENCRYPTION_KEY || "";
const hmacKey = process.env.HMAC_KEY || "";

if (!encryptionKey || encryptionKey.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte (64 hex character) key.");
}

if (!hmacKey || hmacKey.length !== 64) {
  throw new Error("HMAC_KEY must be a 32-byte (64 hex character) key.");
}

const key = Buffer.from(encryptionKey, "hex");
const hmacSecret = Buffer.from(hmacKey, "hex");

export const encryptData = (data: Record<string, any>): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");

  const encryptedPayload = `${iv.toString("hex")}:${encrypted}`;

  // Generate HMAC
  const hmac = crypto.createHmac("sha256", hmacSecret);
  hmac.update(encryptedPayload);
  const hmacDigest = hmac.digest("hex");

  return `${encryptedPayload}:${hmacDigest}`; // ⬅ Urutan harus sama
};

export const decryptData = (data: string): Record<string, any> => {
  try {
    const [ivHex, encryptedData, hmacHex] = data.split(":");
    if (!ivHex || !encryptedData || !hmacHex) {
      throw new Error("Invalid encrypted format.");
    }

    const encryptedPayload = `${ivHex}:${encryptedData}`;

    // Verifikasi HMAC
    const hmac = crypto.createHmac("sha256", hmacSecret);
    hmac.update(encryptedPayload);
    const expectedHmac = hmac.digest("hex");

    if (expectedHmac !== hmacHex) {
      throw new Error("HMAC verification failed. Data may be tampered.");
    }

    // Dekripsi data
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
