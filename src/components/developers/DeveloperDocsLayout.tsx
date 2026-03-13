import type { ReactNode } from "react";
import Link from "next/link";
import type { DeveloperGuide } from "@/types/developer-docs";

type DeveloperDocsLayoutProps = {
  guide: DeveloperGuide;
  children: ReactNode;
};

export const DeveloperDocsLayout = ({
  guide,
  children,
}: DeveloperDocsLayoutProps) => {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_30%),linear-gradient(135deg,_#082f49_0%,_#0f172a_55%,_#1e293b_100%)] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap gap-2">
              {guide.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50"
                >
                  {badge}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">
                Developers
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">
                {guide.title}
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
              {guide.summary}
            </p>
          </div>

          <div className="grid min-w-[240px] gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-sm text-slate-100 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">
                Audience
              </p>
              <p className="mt-1 font-semibold">{guide.audience}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">
                Base URL Dev
              </p>
              <p className="mt-1 break-all font-semibold">{guide.baseUrlDev}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">
                Last updated
              </p>
              <p className="mt-1 font-semibold">{guide.updatedAt}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard/developers"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-cyan-300 hover:text-cyan-800"
        >
          All guides
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">{guide.title}</span>
      </div>

      {children}
    </div>
  );
};
