import type { DeveloperGuideSection } from "@/types/developer-docs";

type DocsSectionNavProps = {
  activeSectionId?: string;
  onSectionSelect?: (sectionId: string) => void;
  sections: DeveloperGuideSection[];
};

export const DocsSectionNav = ({
  activeSectionId,
  onSectionSelect,
  sections,
}: DocsSectionNavProps) => {
  return (
    <nav className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
        On this page
      </p>
      <div className="flex flex-wrap gap-2 lg:flex-col">
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => {
              event.preventDefault();
              onSectionSelect?.(section.id);
            }}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              activeSectionId === section.id
                ? "border-cyan-400 bg-cyan-50 font-semibold text-cyan-900"
                : "border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900"
            }`}
          >
            {index + 1}. {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
};
