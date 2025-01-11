import { clsx } from "clsx";
import {
  forwardRef,
  ForwardRefExoticComponent,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useState,
} from "react";

import {
  HiCheck,
  HiLockClosed,
  HiOutlineEye,
  HiSearch,
  HiX,
} from "react-icons/hi";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  classLabel?: string;
  error?: string;
  info?: string | ReactNode;
  infoType?: "info" | "danger" | "primary" | "success";
  filename?: string;
  handleClick?: () => void;
}

const Input: ForwardRefExoticComponent<Props> = forwardRef<
  HTMLInputElement,
  Props
>(
  (
    {
      type = "text",
      label,
      className,
      classLabel,
      error,
      info,
      infoType = "info",
      filename = "",
      handleClick,
      ...rest
    },
    ref,
  ) => {
    const { name, required } = rest;
    const [isShow, setShow] = useState(false);
    const [isValid, setValid] = useState(false);

    const togglePassword = useCallback(() => {
      setShow((prev) => !prev);
    }, []);

    const handleBlur = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setValid(e.target.validity.valid);
    }, []);

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
        <div className="relative flex w-full flex-row">
          {type === "file" && (
            <div className="w-full grow truncate rounded-l-md border border-gray-300 p-2">
              <p className="truncate dark:text-white">
                {filename || "Select file..."}
              </p>
            </div>
          )}

          <input
            id={name}
            name={name}
            ref={ref}
            type={type === "password" && isShow ? "text" : type}
            className={clsx(
              className,
              "block border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
              "placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500",
              "disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none",
              "invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 dark:bg-black dark:text-white",
              {
                ["h-10 rounded-l-md"]: type === "password" || type === "search",
                ["rounded-md"]: type === "text" || type === "email",
                ["hidden"]: type === "file",
              },
            )}
            onBlur={handleBlur}
            {...rest}
          />

          {type === "password" && (
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-r-md border border-red-800 border-l-transparent bg-red-800 p-2 px-3 hover:bg-red-900"
              onClick={togglePassword}
              aria-pressed={isShow}
              title={isShow ? "Hide password" : "Show password"}
            >
              <span className="flex h-6 w-6 items-center justify-center text-slate-100">
                {isShow ? <HiOutlineEye /> : <HiLockClosed />}
              </span>
            </button>
          )}

          {type === "search" && (
            <button
              type="button"
              className="inline-flex items-center rounded-r-md border border-red-800 bg-red-800 px-3 py-2 text-sm text-slate-200 hover:bg-red-900"
              onClick={handleClick}
            >
              <HiSearch />
            </button>
          )}

          {type === "file" && (
            <label
              htmlFor={name}
              className="flex cursor-pointer select-none items-center rounded-r-md border border-slate-300 bg-white p-2 px-3 hover:bg-blue-400"
            >
              Browse
            </label>
          )}

          {error &&
            type !== "number" &&
            type !== "password" &&
            type !== "file" &&
            type !== "search" && (
              <span
                className={clsx(
                  "absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2",
                  {
                    "text-green-400": isValid,
                    "text-red-600": !isValid,
                  },
                )}
              >
                {isValid ? <HiCheck /> : <HiX />}
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

Input.displayName = "Input";
export default Input;
