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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1000 1000"
    className="h-7 w-7"
  >
    <defs>
      <linearGradient id="pm-lg1" x1="-41.2" y1="693.75" x2="469.1" y2="-.68" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#cb2527" />
        <stop offset="1" stopColor="#e54c3e" />
      </linearGradient>
      <linearGradient id="pm-lg2" x1="293.44" y1="939.66" x2="803.74" y2="245.23" xlinkHref="#pm-lg1" />
      <linearGradient id="pm-lg3" x1="90.33" y1="790.4" x2="600.63" y2="95.97" xlinkHref="#pm-lg1" />
    </defs>
    <path fill="url(#pm-lg1)" d="M308.74,147.1c19.38,0,35.97,7.27,49.78,21.81,13.79,14.55,20.7,31.51,20.7,50.9s-6.9,36.36-20.7,50.9c-13.8,14.54-30.39,21.81-49.78,21.81-21.63-.73-39.34-7.64-53.13-20.69-13.81-13.04-20.7-31.5-20.7-55.37.74-19.38,8.39-35.79,22.94-49.22,14.54-13.42,31.49-20.13,50.89-20.13Z"/>
    <path fill="url(#pm-lg2)" d="M308.74,314.88c19.38,0,35.6,7.09,48.66,21.25,13.04,14.17,20.31,31.32,21.82,51.45v395.97c0,20.13-6.34,36.91-19.02,50.34-12.69,13.42-29.83,20.86-51.46,22.37-19.4,0-35.79-5.96-49.22-17.9-13.42-11.92-21.63-28.7-24.61-50.34v-404.91c1.49-19.38,9.32-35.41,23.5-48.1,14.15-12.67,30.93-19.38,50.33-20.14ZM899.34,143.74c19.38,0,36.35,6.9,50.9,20.7,14.54,13.81,21.81,31.51,21.81,53.13v368.01c0,36.54-7.27,71.21-21.81,104.02-14.55,32.83-34.31,61.52-59.29,86.13-24.99,24.61-53.88,44.18-86.68,58.72-32.83,14.54-67.11,21.82-102.91,21.82s-70.1-7.08-102.9-21.25c-32.83-14.15-61.71-33.56-86.69-58.16-24.99-24.61-44.93-53.3-59.84-86.13-14.93-32.81-22.38-67.85-22.38-105.14s7.28-71.21,21.82-104.03c14.54-32.8,34.29-61.52,59.29-86.13,24.97-24.61,53.86-44.18,86.68-58.72,32.8-14.54,67.48-21.82,104.02-21.82,44.75,0,86.13,10.07,124.16,30.2v-128.64c0-9.68,2.04-19.01,6.15-27.96,4.09-8.95,9.51-16.78,16.22-23.49,6.71-6.71,14.54-11.92,23.49-15.66,8.95-3.72,18.26-5.6,27.97-5.6ZM701.35,460.3c-17.16,0-33.38,3.35-48.66,10.06-15.29,6.71-28.71,15.85-40.27,27.41-11.57,11.57-20.69,24.99-27.41,40.27-6.71,15.28-10.06,31.14-10.06,47.54s3.35,33.37,10.06,48.66c6.72,15.29,15.84,28.52,27.41,39.7,11.55,11.18,24.97,20.14,40.27,26.85,15.28,6.71,31.5,10.06,48.66,10.06s32.06-3.36,46.98-10.06c14.91-6.72,28.14-15.84,39.71-27.41,11.55-11.55,20.69-24.79,27.4-39.7,6.71-14.92,10.07-30.94,10.07-48.1s-3.36-34.48-10.07-49.78c-6.71-15.28-15.85-28.53-27.4-39.71-11.57-11.18-24.8-19.94-39.71-26.29-14.92-6.32-30.58-9.5-46.98-9.5Z"/>
    <path fill="url(#pm-lg3)" d="M106.35,693.79c20.58,0,38.2,7.72,52.86,23.16,14.65,15.45,21.98,33.47,21.98,54.05s-7.33,38.6-21.98,54.04c-14.66,15.44-32.27,23.16-52.86,23.16-22.97-.78-41.77-8.11-56.42-21.97-14.66-13.84-21.98-33.44-21.98-58.8.78-20.58,8.91-38.01,24.35-52.26,15.44-14.25,33.44-21.37,54.04-21.37Z"/>
  </svg>
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
