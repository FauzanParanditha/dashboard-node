import crypto from "crypto";

export const createSignatureForward = (
  httpMethod: string,
  endpointUrl: string,
  body: Record<string, any>,
  timestamp: string,
) => {
  const secret = process.env.NEXT_PUBLIC_SECRET_KEY;

  if (!secret) {
    throw new Error("SECRET_KEY is not defined");
  }

  // const privateKey = process.env.PRIVATE_KEY;
  // if (!privateKey) throw new Error("PRIVATE_KEY is not defined");

  // console.log("Private key length:", privateKey.length);

  const minifiedBody = minifyJson(body);

  const hashedBody = crypto
    .createHash("sha256")
    .update(minifiedBody, "utf8")
    .digest("hex")
    .toLowerCase();
  const stringContent = `${httpMethod}:${endpointUrl}:${hashedBody}:${timestamp}`;
  // console.log(stringContent);

  try {
    const sign = crypto.createHmac("sha256", secret);
    sign.update(stringContent);
    const signature = sign.digest("base64"); // Sign and encode in Base64
    return signature;
  } catch (err) {
    console.error("Error signing:", err);
    return null;
  }
};

export const minifyJson = (body: Record<string, any>) => {
  if (typeof body !== "object" || body === null) {
    throw new TypeError("Input must be a non-null JSON object");
  }

  // Minify JSON except the `payer` field
  const minified = JSON.stringify(body, (key, value) => {
    if (value === null) return undefined; // Remove null values
    return value;
  });

  // Parse back into an object to process `payer` separately
  const parsed = JSON.parse(minified);
  if (parsed.payer) {
    parsed.payer = body.payer; // Retain original spacing in `payer`
  }

  // Return the final JSON string
  return JSON.stringify(parsed);
};

export const convertDateString = (dateString: string) => {
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // Months are 0-indexed
  const day = parseInt(dateString.substring(6, 8), 10);
  const hours = parseInt(dateString.substring(8, 10), 10);
  const minutes = parseInt(dateString.substring(10, 12), 10);
  const seconds = parseInt(dateString.substring(12, 14), 10);

  return new Date(year, month, day, hours, minutes, seconds);
};
