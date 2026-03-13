import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language: string;
  label: string;
  description?: string;
};

export const CodeBlock = ({
  code,
  language,
  label,
  description,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Copied ${label}`, { theme: "colored" });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Failed to copy snippet", { theme: "colored" });
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          {description ? (
            <p className="text-xs text-slate-400">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
        >
          {copied ? <CheckOutlined /> : <CopyOutlined />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="m-0 min-w-full bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
      <div className="border-t border-slate-800 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {language}
      </div>
    </div>
  );
};
