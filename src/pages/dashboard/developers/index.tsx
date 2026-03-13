import Head from "next/head";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import { DashboardLayout } from "@/components/layout";
import { developerGuides } from "@/constant/developer-docs";
import { useAuthGuard } from "@/hooks/use-auth";

const DevelopersPage = () => {
  useAuthGuard(["developer_docs:read"]);

  return (
    <>
      <Head>
        <title>Developers</title>
      </Head>
      <DashboardLayout>
        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#164e63_0%,_#0f172a_50%,_#111827_100%)] p-6 text-white shadow-xl md:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">
            Developer Portal
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            Panduan integrasi yang siap dipakai client
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
            Gunakan halaman ini sebagai titik masuk integrasi. Konten PDF sudah
            diubah menjadi docs yang lebih mudah discan, lengkap dengan snippet,
            endpoint summary, dan preview request yang aman untuk frontend.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {developerGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/dashboard/developers/${guide.slug}`}
              className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-700">
                    {guide.audience}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    {guide.title}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 p-3 text-slate-400 transition group-hover:border-cyan-300 group-hover:text-cyan-700">
                  <RightOutlined />
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {guide.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {guide.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>Updated {guide.updatedAt}</span>
                <span className="font-semibold text-cyan-700">Open guide</span>
              </div>
            </Link>
          ))}
        </section>
      </DashboardLayout>
    </>
  );
};

export default DevelopersPage;
