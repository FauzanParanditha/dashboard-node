// Client-side helper that asks the server to encrypt a payload.
// Encryption keys never reach the browser — see src/pages/api/encrypt.ts.
export const encryptDataRemote = async (
  data: Record<string, any>,
): Promise<string> => {
  const res = await fetch("/api/encrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to encrypt data");
  }

  const { q } = await res.json();
  if (!q) {
    throw new Error("Encryption response missing token");
  }

  return q as string;
};
