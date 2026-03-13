import type { DeveloperGuide } from "@/types/developer-docs";

export const developerGuides: DeveloperGuide[] = [
  {
    slug: "pandi-payment-gateway",
    title: "PANDI Payment Gateway",
    subtitle: "Panduan integrasi pembayaran invoice untuk client integrator.",
    updatedAt: "2025-09-02",
    audience: "Client integrator",
    summary:
      "Dokumentasi ini mengubah panduan PDF menjadi langkah integrasi yang lebih cepat discan: dari create payment link, iframe checkout, event hasil transaksi, sampai webhook final.",
    badges: [
      "Dashboard only",
      "JWT required",
      "Webhook enabled",
      "Iframe checkout",
    ],
    baseUrlDev: "https://dev.api.pg.pandi.id/api/v1",
    testerDefaults: {
      endpointUrl: "/order/create/link",
      phoneNumber: "6281234567890",
      paymentMethod: "paylabs",
      itemId: "domain-123",
      itemName: "Create Domain",
      itemType: "domain",
      itemPrice: "150000",
      quantity: "1",
      totalAmount: "150000.00",
    },
    endpointSummaries: [
      {
        method: "POST",
        path: "/order/create/link",
        purpose: "Generate payment link ke PANDI Payment Gateway.",
        audience: "Gateway API",
      },
      {
        method: "POST",
        path: "Configured webhook URL",
        purpose: "Terima notifikasi status transaksi dari PANDI Payment Gateway.",
        audience: "Gateway callback",
      },
      {
        method: "EVENT",
        path: "window.postMessage",
        purpose: "Terima result awal dari iframe checkout di frontend.",
        audience: "Iframe event",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        summary:
          "Alur utama pembayaran invoice berjalan dari service integrasi Anda ke iframe pembayaran lalu diselesaikan oleh webhook.",
        paragraphs: [
          "Integrasi ini memungkinkan user membayar invoice menggunakan PANDI Payment Gateway melalui payment link yang ditampilkan di dalam iframe.",
          "Frontend menerima hasil awal dari iframe lewat postMessage, tetapi status final tetap harus dianggap berasal dari webhook agar sinkron dengan sistem Anda.",
        ],
        bullets: [
          "Generate payment link dari backend/service integrasi Anda.",
          "Tampilkan payment page PANDI di modal iframe.",
          "Tangani success, cancel, atau pending dari iframe.",
          "Sinkronkan status final melalui webhook dan update sistem Anda.",
        ],
      },
      {
        id: "prerequisites",
        title: "Prasyarat",
        bullets: [
          "Environment variable: NEXT_PUBLIC_CLIENT_PAYLABS_ID, STORE_ID, PARTNER_ID.",
          "IP server harus di-whitelist oleh PANDI Payment Gateway.",
          "Nomor telepon user harus valid dalam format Indonesia.",
          "Sediakan public key public.pem untuk verifikasi signature dari gateway.",
          "Simpan private key signing di backend, bukan di browser.",
        ],
        callouts: [
          {
            title: "Material sensitif",
            tone: "warning",
            content: [
              "Private key hanya boleh dipakai di backend untuk membentuk x-signature.",
              "Frontend tidak boleh membaca file key, tidak boleh menandatangani request produksi, dan tidak boleh memanggil endpoint gateway secara langsung.",
            ],
          },
          {
            title: "Mapping Partner ID",
            tone: "info",
            content: [
              "PARTNER_ID tetap menggunakan nama Partner ID pada request ke PANDI Payment Gateway.",
              "Nilai Partner ID tersebut sama dengan Client ID yang tampil pada menu Client di dashboard.",
            ],
          },
        ],
      },
      {
        id: "flow",
        title: "Alur Integrasi",
        table: {
          columns: ["Langkah", "Aksi"],
          rows: [
            ["1", "User membuka halaman invoice."],
            ["2", "User klik Checkout lalu service integrasi Anda menyiapkan request pembayaran."],
            ["3", "Backend membuat request ke PANDI Payment Gateway untuk generate payment link."],
            ["4", "Frontend membuka modal iframe dengan paymentLink dari backend."],
            ["5", "User menyelesaikan pembayaran di iframe."],
            ["6", "Iframe mengirim postMessage sukses, gagal, cancel, atau pending ke frontend."],
            ["7", "Aplikasi Anda dapat memakai hasil iframe untuk update UI sementara."],
            ["8", "Webhook PANDI mengirim status terbaru ke endpoint callback Anda untuk finalisasi."],
            ["9", "Sistem Anda menyimpan status final dan melanjutkan proses bisnis terkait."],
          ],
        },
      },
      {
        id: "authentication",
        title: "Autentikasi dan Signature",
        paragraphs: [
          "Setiap request ke PANDI Payment Gateway wajib menyertakan partner id, timestamp ISO 8601 zona Asia/Jakarta, dan x-signature dengan algoritma RSA-SHA256.",
          "String yang ditandatangani selalu dibentuk dari method, endpoint URL, hashed body, dan timestamp yang sama persis dengan header request.",
        ],
        table: {
          columns: ["Header", "Deskripsi"],
          rows: [
            [
              "X-PARTNER-ID",
              "Partner ID untuk request gateway. Nilainya sama dengan Client ID yang ada di menu Client.",
            ],
            ["X-SIGNATURE", "Signature RSA-SHA256 yang telah di-base64."],
            ["X-TIMESTAMP", "Timestamp ISO 8601 Asia/Jakarta."],
          ],
        },
        callouts: [
          {
            title: "Format string to sign",
            tone: "info",
            content: [
              "<HTTP_METHOD>:<ENDPOINT_URL>:<HASHED_BODY>:<TIMESTAMP>",
              "Body harus di-minify terlebih dahulu, lalu di-hash SHA-256 hex lowercase sebelum dibentuk menjadi string-to-sign.",
            ],
          },
          {
            title: "Tempat generate signature",
            tone: "warning",
            content: [
              "Generate key pair dan proses signing harus dijalankan di backend atau server environment yang aman.",
              "Jangan expose private key ke browser, localStorage, atau form tester di halaman docs.",
            ],
          },
        ],
        codeExamples: [
          {
            label: "OpenSSL generate key pair",
            language: "bash",
            code: `openssl genrsa -out rsakey.pem 2048

openssl pkcs8 -topk8 -nocrypt -inform PEM -in rsakey.pem -outform PEM -out private-key.pem

openssl rsa -inform PEM -in rsakey.pem -pubout -outform PEM -out public-key.pem`,
            description:
              "Gunakan private key untuk signing request backend dan public key untuk verifikasi yang diperlukan.",
          },
          {
            label: "OpenSSL create signature (manual verification)",
            language: "bash",
            code: `printf '%s' "$STRING_TO_SIGN" | openssl dgst -sha256 -sign private-key.pem | openssl base64 -A`,
            description:
              "Contoh manual untuk menghasilkan nilai X-SIGNATURE dari string-to-sign yang sudah Anda bentuk.",
          },
          {
            label: "Node.js header builder",
            language: "ts",
            code: `import crypto from "crypto";
import fs from "fs";
import path from "path";

export function generateHeadersPartnerId(
  method: string,
  endpointUrl: string,
  bodyObj: Record<string, unknown>,
  privateKeyPath = "private-key.pem",
) {
  const minifiedBody = JSON.stringify(bodyObj);
  const timestamp = new Date().toISOString();
  const hashedBody = crypto
    .createHash("sha256")
    .update(minifiedBody)
    .digest("hex");
  const stringToSign = \`\${method}:\${endpointUrl}:\${hashedBody}:\${timestamp}\`;
  const privateKeyPem = fs.readFileSync(
    path.resolve(process.cwd(), privateKeyPath),
    "utf8",
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(stringToSign);
  signer.end();

  return {
    "Content-Type": "application/json;charset=utf-8",
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signer.sign(privateKeyPem, "base64"),
    "X-PARTNER-ID": process.env.PARTNER_ID,
  };
}`,
          },
          {
            label: "Node.js signature only",
            language: "ts",
            code: `import crypto from "crypto";
import fs from "fs";

export function createPandiSignature(
  stringToSign: string,
  privateKeyPath: string,
) {
  const privateKeyPem = fs.readFileSync(privateKeyPath, "utf8");
  const signer = crypto.createSign("RSA-SHA256");

  signer.update(stringToSign);
  signer.end();

  return signer.sign(privateKeyPem, "base64");
}`,
            description:
              "Pakai fungsi ini di backend setelah string-to-sign selesai dibentuk.",
          },
        ],
      },
      {
        id: "create-link",
        title: "Create Payment Link",
        paragraphs: [
          "Service integrasi Anda menyiapkan payload order lalu meneruskannya ke PANDI Payment Gateway untuk mendapatkan payment link.",
          "Payload item sebaiknya konsisten dengan referensi order di sistem Anda agar mudah dilakukan rekonsiliasi saat webhook diterima.",
        ],
        codeExamples: [
          {
            label: "Contoh payload /order/create/link",
            language: "json",
            code: `{
  "items": [
    {
      "id": "domain-123",
      "price": "150000",
      "quantity": "1",
      "name": "Create Domain",
      "type": "domain"
    }
  ],
  "totalAmount": "150000.00",
  "phoneNumber": "6281234567890",
  "paymentMethod": "paylabs"
}`,
          },
        ],
      },
      {
        id: "iframe",
        title: "Iframe dan postMessage",
        paragraphs: [
          "Frontend menampilkan checkout di modal iframe. Setelah user berinteraksi, iframe akan mengirimkan message code yang perlu dipetakan ke aksi aplikasi Anda.",
        ],
        table: {
          columns: ["Message", "Arti", "Tindakan yang disarankan"],
          rows: [
            ["01", "Berhasil", "Tampilkan status sukses sementara dan tunggu webhook final."],
            ["05", "Dibatalkan", "Tutup iframe atau tampilkan status batal ke user."],
            ["00", "Pending", "Refresh status order dan tunggu webhook."],
          ],
        },
        codeExamples: [
          {
            label: "Contoh iframe component",
            language: "tsx",
            code: `<ModalIframe
  url={paymentLink}
  onPaymentSuccess={handlePaymentSuccess}
  onPaymentFailure={handlePaymentFailure}
/>`,
          },
          {
            label: "Contoh payload postMessage",
            language: "json",
            code: `{
  "message": "01",
  "data": {
    "id": "PLB-ORD-001",
    "paymentId": "PLB-PAY-123"
  },
  "link": "https://paylabs.link/abc123"
}`,
          },
        ],
      },
      {
        id: "webhook",
        title: "Webhook",
        paragraphs: [
          "Status final transaksi harus berasal dari webhook karena hasil iframe hanya memberi sinyal awal pada frontend.",
          "Verifikasi webhook memakai public key public.pem yang diberikan oleh PANDI Payment Gateway.",
        ],
        codeExamples: [
          {
            label: "Contoh payload webhook",
            language: "json",
            code: `{
  "requestId": "xxxx",
  "errCode": "xxxx",
  "merchantId": "xxxx",
  "storeId": "xxxx",
  "paymentType": "xxxx",
  "amount": 150000,
  "merchantTradeNo": "PL-xxxx",
  "platformTradeNo": "xxxx",
  "createTime": 1725120000,
  "successTime": 1725120300,
  "status": "paid",
  "productName": "Create Domain",
  "paymentMethodInfo": {
    "vaCode": "1234567890"
  },
  "transFeeRate": 0.7,
  "transFeeAmount": 1050,
  "totalTransFee": 1050,
  "vatFee": 115
}`,
          },
          {
            label: "Contoh acknowledgement webhook",
            language: "json",
            code: `{
  "merchantId": "xxx",
  "requestId": "xxx",
  "errCode": "0"
}`,
          },
        ],
        callouts: [
          {
            title: "Validasi wajib",
            tone: "warning",
            content: [
              "Pastikan request webhook divalidasi dengan signature/public key sebelum mengubah status transaksi di sistem Anda.",
              "Gunakan webhook sebagai sumber kebenaran akhir untuk status paid, pending, cancel, expired, dan failed.",
            ],
          },
        ],
      },
      {
        id: "endpoint-summary",
        title: "Ringkasan Endpoint",
        summary:
          "Daftar berikut hanya menampilkan kontrak integrasi yang relevan untuk client: endpoint gateway, callback webhook, dan event iframe.",
      },
      {
        id: "testing",
        title: "Testing Checklist",
        bullets: [
          "Gunakan sandbox paymentLink dari PANDI Payment Gateway untuk pengujian UI checkout.",
          "Simulasikan webhook menggunakan Postman atau curl ke endpoint callback Anda.",
          "Pantau event postMessage dengan window.addEventListener('message', ...).",
          "Pastikan signature webhook diverifikasi menggunakan public.pem.",
          "Uji skenario success, cancel, pending, expired, dan invalid signature.",
        ],
        callouts: [
          {
            title: "Prioritas verifikasi",
            tone: "success",
            content: [
              "Bandingkan payload order Anda, response payment link, event iframe, dan webhook agar jejak transaksi bisa diikuti end-to-end.",
            ],
          },
        ],
      },
    ],
  },
];

export const developerGuideBySlug = developerGuides.reduce<
  Record<string, DeveloperGuide>
>((acc, guide) => {
  acc[guide.slug] = guide;
  return acc;
}, {});
