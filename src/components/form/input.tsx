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
    ref
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
              "text-sm text-slate-500 dark:text-slate-200"
            )}
          >
            {label}
            {required && <span className="text-xs text-red-800">*</span>}
          </label>
        )}
        <div className="flex flex-row w-full relative">
          {type === "file" && (
            <div className="grow rounded-l-md border border-gray-300 p-2 w-full truncate">
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
              "block px-3 py-2 bg-white border border-slate-300 text-sm shadow-sm",
              "placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500",
              "disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none",
              "invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500",
              {
                ["rounded-l-md h-10"]: type === "password" || type === "search",
                ["rounded-md"]: type === "text" || type === "email",
                ["hidden"]: type === "file",
              }
            )}
            onBlur={handleBlur}
            {...rest}
          />

          {type === "password" && (
            <button
              type="button"
              className="inline-flex items-center h-10 p-2 px-3 border border-red-800 border-l-transparent bg-red-800 hover:bg-red-900 rounded-r-md"
              onClick={togglePassword}
              aria-pressed={isShow}
              title={isShow ? "Hide password" : "Show password"}
            >
              <span className="text-slate-100 h-6 w-6 flex items-center justify-center">
                {isShow ? <HiOutlineEye /> : <HiLockClosed />}
              </span>
            </button>
          )}

          {type === "search" && (
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 text-sm text-slate-200 bg-red-800 hover:bg-red-900 rounded-r-md border border-red-800"
              onClick={handleClick}
            >
              <HiSearch />
            </button>
          )}

          {type === "file" && (
            <label
              htmlFor={name}
              className="cursor-pointer select-none flex items-center p-2 px-3 border border-slate-300 bg-white hover:bg-blue-400 rounded-r-md"
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
                  "h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2",
                  {
                    "text-green-400": isValid,
                    "text-red-600": !isValid,
                  }
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
  }
);

Input.displayName = "Input";
export default Input;
