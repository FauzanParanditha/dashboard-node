import { clsx } from "clsx";
import {
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  TextareaHTMLAttributes,
  useCallback,
  useState,
} from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
  classLabel?: string;
  error?: string;
  info?: string | ReactNode;
  infoType?: "info" | "danger" | "primary" | "success";
}

const TextArea: ForwardRefExoticComponent<Props> = forwardRef<
  HTMLTextAreaElement,
  Props
>(
  (
    { label, className, classLabel, error, info, infoType = "info", ...rest },
    ref,
  ) => {
    const { name, required } = rest;
    const [isValid, setValid] = useState(false);

    const handleBlur = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValid(e.target.validity.valid);
      },
      [],
    );

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={name}
            className={clsx(
              classLabel,
              "text-sm text-slate-500 dark:text-slate-200",
            )}
          >
            {label}
            {required && <span className="text-xs text-red-800">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            id={name}
            name={name}
            ref={ref}
            className={clsx(
              className,
              "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
              "placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
              "disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none",
              "invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500",
              "dark:bg-black dark:text-white",
            )}
            onBlur={handleBlur}
            {...rest}
          />

          {error && (
            <span
              className={clsx("absolute right-4 top-3 h-4 w-4", {
                "text-green-400": isValid,
                "text-red-600": !isValid,
              })}
            >
              {/* Bisa tambah icon validasi jika mau */}
            </span>
          )}
        </div>
        {!error && info && (
          <p
            className={clsx("text-xs", {
              "text-red-800": infoType === "danger",
              "text-emerald-700": infoType === "success",
              "text-blue-700": infoType === "primary",
              "text-slate-400": infoType === "info",
            })}
          >
            {info}
          </p>
        )}
        {error && <span className="text-xs text-red-800">{error}</span>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
export default TextArea;
