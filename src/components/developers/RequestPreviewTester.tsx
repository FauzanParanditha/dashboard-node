import { useEffect, useMemo, useState } from "react";
import { Alert } from "antd";
import { CodeBlock } from "./CodeBlock";
import type { DeveloperGuide } from "@/types/developer-docs";

type RequestPreviewTesterProps = {
  guide: DeveloperGuide;
};

const toJakartaIsoString = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    },
    {},
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+07:00`;
};

const sha256Hex = async (value: string) => {
  if (!window.crypto?.subtle) {
    return "";
  }

  const buffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(buffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
};

const pemToArrayBuffer = (pem: string) => {
  const cleanedPem = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  const binary = window.atob(cleanedPem);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
};

const arrayBufferToPem = (
  buffer: ArrayBuffer,
  header: "PRIVATE KEY" | "PUBLIC KEY",
) => {
  const base64 = arrayBufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g)?.join("\n") || base64;
  return `-----BEGIN ${header}-----\n${lines}\n-----END ${header}-----`;
};

export const RequestPreviewTester = ({ guide }: RequestPreviewTesterProps) => {
  const defaults = guide.testerDefaults;
  const [endpointUrl, setEndpointUrl] = useState(defaults.endpointUrl);
  const [phoneNumber, setPhoneNumber] = useState(defaults.phoneNumber);
  const [paymentMethod, setPaymentMethod] = useState(defaults.paymentMethod);
  const [itemId, setItemId] = useState(defaults.itemId);
  const [itemName, setItemName] = useState(defaults.itemName);
  const [itemType, setItemType] = useState(defaults.itemType);
  const [itemPrice, setItemPrice] = useState(defaults.itemPrice);
  const [quantity, setQuantity] = useState(defaults.quantity);
  const [totalAmount, setTotalAmount] = useState(defaults.totalAmount);
  const [hashedBody, setHashedBody] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [signatureError, setSignatureError] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const hasMissingRequiredFields = [
    endpointUrl,
    phoneNumber,
    paymentMethod,
    itemId,
    itemName,
    itemType,
    itemPrice,
    quantity,
    totalAmount,
  ].some((value) => !value.trim());

  const timestamp = useMemo(() => toJakartaIsoString(new Date()), []);

  const payload = useMemo(
    () => ({
      items: [
        {
          id: itemId,
          price: itemPrice,
          quantity,
          name: itemName,
          type: itemType,
        },
      ],
      totalAmount,
      phoneNumber,
      paymentMethod,
    }),
    [
      itemId,
      itemName,
      itemPrice,
      itemType,
      paymentMethod,
      phoneNumber,
      quantity,
      totalAmount,
    ],
  );

  const minifiedBody = useMemo(() => JSON.stringify(payload), [payload]);
  const prettyBody = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const stringToSign = useMemo(
    () => `POST:${endpointUrl}:${hashedBody || "<hashed_body>"}:${timestamp}`,
    [endpointUrl, hashedBody, timestamp],
  );
  const headersPreview = useMemo(
    () =>
      JSON.stringify(
        {
          "Content-Type": "application/json;charset=utf-8",
          "X-TIMESTAMP": timestamp,
          "X-PARTNER-ID": "CLIENT_ID_FROM_CLIENT_MENU",
          "X-SIGNATURE": "<generated_on_backend_with_rsa_sha256>",
        },
        null,
        2,
      ),
    [timestamp],
  );

  useEffect(() => {
    let active = true;

    sha256Hex(minifiedBody).then((digest) => {
      if (active) {
        setHashedBody(digest);
      }
    });

    return () => {
      active = false;
    };
  }, [minifiedBody]);

  const handleGenerateDemoKey = async () => {
    if (!window.crypto?.subtle) {
      setSignatureError("Browser ini tidak mendukung Web Crypto untuk generate key.");
      return;
    }

    try {
      setIsGeneratingKey(true);
      setSignatureError("");

      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
      );

      const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey,
      );
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );

      setPrivateKeyPem(arrayBufferToPem(exportedPrivateKey, "PRIVATE KEY"));
      setPublicKeyPem(arrayBufferToPem(exportedPublicKey, "PUBLIC KEY"));
      setSignaturePreview("");
    } catch {
      setSignatureError("Gagal membuat demo key pair di browser.");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleGenerateSignature = async () => {
    if (!privateKeyPem.trim()) {
      setSignatureError("Isi private key terlebih dahulu atau gunakan Generate demo key.");
      setSignaturePreview("");
      return;
    }

    if (!window.crypto?.subtle) {
      setSignatureError("Browser ini tidak mendukung Web Crypto untuk signing.");
      setSignaturePreview("");
      return;
    }

    try {
      setIsSigning(true);
      setSignatureError("");

      const cryptoKey = await window.crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBuffer(privateKeyPem),
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        false,
        ["sign"],
      );

      const signature = await window.crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(stringToSign),
      );

      setSignaturePreview(arrayBufferToBase64(signature));
    } catch {
      setSignatureError(
        "Gagal membuat signature. Pastikan private key berformat PKCS#8 PEM.",
      );
      setSignaturePreview("");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <section
      id="request-preview-tester"
      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-700">
          Advanced Sandbox
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Preview request tanpa memanggil API live
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Gunakan form ini untuk memeriksa bentuk payload, hashed body, dan
          string-to-sign. Playground di bawah tersedia untuk demo key dan
          signature lokal di browser, tetapi signature produksi tetap sebaiknya
          dibuat di backend dengan private key RSA-SHA256.
        </p>
      </div>

      {hasMissingRequiredFields ? (
        <Alert
          type="warning"
          showIcon
          className="mb-5"
          message="Semua field preview perlu diisi agar output request lengkap."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-2 text-sm text-slate-700">
          Endpoint URL
          <input
            value={endpointUrl}
            onChange={(event) => setEndpointUrl(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Phone number
          <input
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Payment method
          <input
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Item ID
          <input
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Item name
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Item type
          <input
            value={itemType}
            onChange={(event) => setItemType(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Item price
          <input
            value={itemPrice}
            onChange={(event) => setItemPrice(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Quantity
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-700">
          Total amount
          <input
            value={totalAmount}
            onChange={(event) => setTotalAmount(event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <CodeBlock
          label="Request payload preview"
          language="json"
          code={prettyBody}
        />
        <CodeBlock
          label="Headers preview"
          language="json"
          code={headersPreview}
        />
        <CodeBlock
          label="Minified body"
          language="text"
          code={minifiedBody}
        />
        <CodeBlock
          label="Hashed body (SHA-256 hex)"
          language="text"
          code={hashedBody || "<waiting_for_browser_crypto>"}
        />
        <div className="xl:col-span-2">
          <CodeBlock
            label="String to sign"
            language="text"
            code={stringToSign}
            description="Signature RSA-SHA256 harus dibuat di backend memakai string ini."
          />
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
            Signature Playground
          </p>
          <h3 className="mt-2 text-xl font-semibold text-amber-950">
            Demo key pair dan X-SIGNATURE di browser
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-amber-900">
            Playground ini tidak menyimpan key ke server atau storage aplikasi.
            Gunakan hanya untuk dev atau sandbox, lalu hapus key setelah selesai.
          </p>
        </div>

        <Alert
          type="warning"
          showIcon
          className="mb-5"
          message="Demo ini mendukung generate key pair lokal dan import private key PKCS#8 PEM. Jangan gunakan key produksi di browser."
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateDemoKey}
            disabled={isGeneratingKey}
            className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingKey ? "Generating key..." : "Generate demo key"}
          </button>
          <button
            type="button"
            onClick={handleGenerateSignature}
            disabled={isSigning}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigning ? "Generating..." : "Generate signature"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPrivateKeyPem("");
              setPublicKeyPem("");
              setSignaturePreview("");
              setSignatureError("");
            }}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            Clear key
          </button>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-700">
            Private key PEM
            <textarea
              value={privateKeyPem}
              onChange={(event) => setPrivateKeyPem(event.target.value)}
              rows={10}
              spellCheck={false}
              placeholder="-----BEGIN PRIVATE KEY-----"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            Public key PEM
            <textarea
              value={publicKeyPem}
              onChange={(event) => setPublicKeyPem(event.target.value)}
              rows={10}
              spellCheck={false}
              placeholder="-----BEGIN PUBLIC KEY-----"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-cyan-500"
            />
          </label>
        </div>

        {signatureError ? (
          <Alert
            type="error"
            showIcon
            className="mt-5"
            message={signatureError}
          />
        ) : null}

        {signaturePreview ? (
          <div className="mt-5">
            <CodeBlock
              label="Generated X-SIGNATURE"
              language="text"
              code={signaturePreview}
              description="Nilai base64 ini dihasilkan dari string-to-sign yang aktif pada form di atas."
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};
