import clsx from "clsx";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Stepper from "./Stepper";

/**
 * Payment iframe integration:
 *
 * Mount this URL in an iframe and listen for resize events:
 *
 *   <iframe src="https://pay.pandi.id/payment?q=..." id="pay" width="480" />
 *   <script>
 *     window.addEventListener("message", (e) => {
 *       if (e.data?.type === "pandi-payment:resize") {
 *         document.getElementById("pay").style.height = e.data.height + "px";
 *       }
 *     });
 *   </script>
 *
 * Query params:
 *   ?embed=1       force iframe styling even when opened standalone
 *   ?brand=hidden  hide PANDI Payment header strip (white-label)
 */

type PaymentShellProps = {
  currentStep: 1 | 2 | 3;
  orderId?: string;
  brandHidden?: boolean;
  children: React.ReactNode;
};

const LogoMark = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-sky-700 text-white">
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h2m3 0h2"
      />
    </svg>
  </div>
);

const SecureBadge = () => (
  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M2.166 4.999A11.95 11.95 0 0010 1.944a11.95 11.95 0 007.834 3.055 12.01 12.01 0 01-7.834 14.99A12.01 12.01 0 012.166 5z"
        clipRule="evenodd"
      />
    </svg>
    Secure
  </span>
);

export default function PaymentShell({
  currentStep,
  orderId,
  brandHidden: brandHiddenProp,
  children,
}: PaymentShellProps) {
  const router = useRouter();
  const [isEmbed, setIsEmbed] = useState(false);
  const [brandHiddenFromQuery, setBrandHiddenFromQuery] = useState(false);

  const brandHidden = brandHiddenProp || brandHiddenFromQuery;

  useEffect(() => {
    if (router.query.brand !== undefined) {
      setBrandHiddenFromQuery(router.query.brand === "hidden");
    }
  }, [router.query.brand]);

  useEffect(() => {
    const inIframe = window.self !== window.top;
    const fromQuery =
      new URLSearchParams(window.location.search).get("embed") === "1";
    const embed = inIframe || fromQuery;
    setIsEmbed(embed);

    if (!embed) return;

    const emit = () => {
      try {
        window.parent.postMessage(
          {
            type: "pandi-payment:resize",
            height: document.documentElement.scrollHeight,
          },
          "*",
        );
      } catch {
        /* parent origin restricts us; ignore */
      }
    };

    emit();
    const ro = new ResizeObserver(emit);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={clsx(
        "flex justify-center px-4",
        isEmbed
          ? "items-start py-2"
          : "min-h-screen items-start bg-slate-100 py-6 sm:py-10",
      )}
    >
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {!brandHidden && (
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <LogoMark />
                <span className="text-sm font-semibold text-slate-900">
                  PANDI Payment
                </span>
                <SecureBadge />
              </div>
              {orderId && (
                <div className="text-right">
                  <div className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                    Order ID
                  </div>
                  <div className="font-mono text-[10px] font-medium text-slate-600">
                    {orderId}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="px-5 py-4">
            <Stepper current={currentStep} />
          </div>
          <div className="px-5 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
