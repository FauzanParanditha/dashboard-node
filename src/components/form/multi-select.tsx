import { clsx } from "clsx";
import {
  forwardRef,
  ForwardRefExoticComponent,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
} from "react";
import ReactSelect from "react-select";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  onChange: (...event: any[]) => void;
  value?: Array<string | number | boolean>;
  label?: string;
  options: { value: string | number | boolean; label: string }[];
  info?: string | ReactNode;
  infoType?: "info" | "danger" | "primary" | "success";
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: any;
  onBlur?: any;
}

const MultiSelectField: ForwardRefExoticComponent<Props> = forwardRef<
  HTMLInputElement,
  Props
>(
  (
    {
      value = [],
      onChange,
      label,
      options = [],
      info,
      infoType = "info",
      error,
      disabled = false,
      placeholder,
      defaultValue,
      onBlur,
      ...rest
    },
    ref: any,
  ) => {
    const styles = {
      control: (provided: any) => ({
        ...provided,
        border: error ? "1px solid #DB2777" : "",
      }),
    };
    const { name, required } = rest;

    useEffect(() => {
      if (defaultValue) {
        onChange(defaultValue.map((v: any) => v.value));
      }
    }, [defaultValue]);

    const selected = options.filter((opt) => value?.includes(opt.value));

    return (
      <div className="space-y-2">
        {label && (
          <label
            className="text-sm text-slate-500 dark:text-white"
            htmlFor={name}
          >
            {label}
            {required && <span className="text-xs text-red-800">*</span>}
          </label>
        )}
        <div className="relative">
          <ReactSelect
            ref={ref}
            styles={styles}
            instanceId={name}
            name={name}
            isMulti
            options={options}
            value={selected}
            onChange={(vals: any) =>
              onChange(Array.isArray(vals) ? vals.map((v) => v.value) : [])
            }
            isDisabled={disabled}
            placeholder={placeholder}
            className="w-full"
            onBlur={onBlur}
          />
        </div>
        {!error && info && (
          <p
            className={clsx("inline-block text-xs", {
              ["text-red-800"]: infoType === "danger",
              ["text-emerald-700"]: infoType === "success",
              ["text-blue-700"]: infoType === "primary",
            })}
          >
            {info}
          </p>
        )}
        {error && (
          <span className="inline-block text-sm text-red-800">{error}</span>
        )}
      </div>
    );
  },
);

MultiSelectField.displayName = "multi-select";
export default MultiSelectField;
