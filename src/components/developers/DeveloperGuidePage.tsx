import type {
  DeveloperGuide,
  DeveloperGuideSection,
  DocsCallout,
} from "@/types/developer-docs";
import { Alert } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { DeveloperDocsLayout } from "./DeveloperDocsLayout";
import { DocsSectionNav } from "./DocsSectionNav";
import { RequestPreviewTester } from "./RequestPreviewTester";

const calloutStyles: Record<DocsCallout["tone"], string> = {
  info: "border-cyan-200 bg-cyan-50 text-cyan-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

const renderTable = (section: DeveloperGuideSection) => {
  if (!section.table) return null;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              {section.table.columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left font-semibold text-slate-700"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {section.table.rows.map((row, index) => (
              <tr key={`${section.id}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${section.id}-${index}-${cellIndex}`}
                    className="px-4 py-3 align-top leading-6 text-slate-600"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DeveloperGuidePage = ({ guide }: { guide: DeveloperGuide }) => {
  const sectionIds = useMemo(
    () => [
      ...guide.sections.map((section) => section.id),
      "request-preview-tester",
    ],
    [guide.sections],
  );
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] || "");

  useEffect(() => {
    const scrollContainer = document.getElementById(
      "dashboard-scroll-container",
    );
    let hasAppliedInitialHashScroll = false;

    const scrollToSection = (
      sectionId: string,
      behavior: ScrollBehavior = "smooth",
    ) => {
      const element = document.getElementById(sectionId);

      if (!scrollContainer || !element) return;

      const nextTop =
        element.getBoundingClientRect().top -
        scrollContainer.getBoundingClientRect().top +
        scrollContainer.scrollTop;

      scrollContainer.scrollTo({
        top: Math.max(nextTop, 0),
        behavior,
      });
    };

    const resolveActiveSection = () => {
      const hash = window.location.hash.replace("#", "");
      const containerTop = scrollContainer?.getBoundingClientRect().top || 0;
      let nextActiveSection = sectionIds[0] || "";

      sectionIds.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) return;

        if (element.getBoundingClientRect().top - containerTop <= 180) {
          nextActiveSection = sectionId;
        }
      });

      if (hash && sectionIds.includes(hash)) {
        if (!hasAppliedInitialHashScroll) {
          hasAppliedInitialHashScroll = true;
          scrollToSection(hash, "auto");
        }
        setActiveSectionId(hash);
        return;
      }

      setActiveSectionId(nextActiveSection);
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash || !sectionIds.includes(hash)) return;

      scrollToSection(hash);
      setActiveSectionId(hash);
    };

    resolveActiveSection();
    scrollContainer?.addEventListener("scroll", resolveActiveSection, {
      passive: true,
    });
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      scrollContainer?.removeEventListener("scroll", resolveActiveSection);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [sectionIds]);

  const scrollToSection = (sectionId: string) => {
    const scrollContainer = document.getElementById(
      "dashboard-scroll-container",
    );
    const element = document.getElementById(sectionId);

    if (!scrollContainer || !element) return;

    const nextTop =
      element.getBoundingClientRect().top -
      scrollContainer.getBoundingClientRect().top +
      scrollContainer.scrollTop;

    scrollContainer.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSectionId(sectionId);
  };

  return (
    <DeveloperDocsLayout guide={guide}>
      <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
        <div className="xl:sticky xl:top-4 xl:self-start">
          <div className="space-y-4">
            <DocsSectionNav
              activeSectionId={activeSectionId}
              onSectionSelect={scrollToSection}
              sections={guide.sections}
            />
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Quick jump
              </p>
              <div className="grid gap-2">
                <a
                  href="#request-preview-tester"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("request-preview-tester");
                  }}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    activeSectionId === "request-preview-tester"
                      ? "border-cyan-400 bg-cyan-50 font-semibold text-cyan-900"
                      : "border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900"
                  }`}
                >
                  API tester ringan
                </a>
                <Link
                  href="/dashboard/developers"
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900"
                >
                  Guide list
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {guide.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-700">
                  Section
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {section.title}
                </h2>
                {section.summary ? (
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                    {section.summary}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-slate-600 md:text-base"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="grid gap-2 rounded-[1.5rem] bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.callouts?.map((callout) => (
                  <div
                    key={`${section.id}-${callout.title}`}
                    className={`rounded-[1.5rem] border p-4 ${calloutStyles[callout.tone]}`}
                  >
                    <p className="text-sm font-semibold">{callout.title}</p>
                    <div className="mt-2 grid gap-2 text-sm leading-7">
                      {callout.content.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {section.id === "endpoint-summary" ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Method
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Endpoint
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Fungsi
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Tipe
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {guide.endpointSummaries.map((endpoint) => (
                            <tr key={`${endpoint.method}-${endpoint.path}`}>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {endpoint.method}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600">
                                {endpoint.path}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {endpoint.purpose}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {endpoint.audience}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {renderTable(section)}

                {section.codeExamples?.map((example) => (
                  <CodeBlock
                    key={`${section.id}-${example.label}`}
                    label={example.label}
                    language={example.language}
                    description={example.description}
                    code={example.code}
                  />
                ))}
              </div>
            </section>
          ))}

          <RequestPreviewTester guide={guide} />

          <Alert
            showIcon
            type="info"
            className="rounded-[1.5rem]"
            message="Catatan implementasi"
            description="Halaman ini hanya membantu integrasi. Request live ke PANDI Payment Gateway, pembentukan signature RSA-SHA256, dan verifikasi webhook tetap harus dilakukan di backend Anda."
          />
        </div>
      </div>
    </DeveloperDocsLayout>
  );
};
