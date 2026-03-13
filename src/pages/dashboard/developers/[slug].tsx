import Head from "next/head";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout";
import { DeveloperGuidePage } from "@/components/developers/DeveloperGuidePage";
import { developerGuideBySlug } from "@/constant/developer-docs";
import { useAuthGuard } from "@/hooks/use-auth";

const DeveloperGuideDetailPage = () => {
  useAuthGuard(["developer_docs:read"]);
  const router = useRouter();
  const isReady = router.isReady;
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;
  const guide = isReady && slug ? developerGuideBySlug[slug] : undefined;

  return (
    <>
      <Head>
        <title>{guide ? `${guide.title} Docs` : "Developer Docs"}</title>
      </Head>
      <DashboardLayout>
        {!isReady ? null : guide ? (
          <DeveloperGuidePage guide={guide} />
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Guide not found
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Dokumentasi yang Anda cari belum tersedia. Kembali ke halaman
              developers untuk membuka guide yang aktif.
            </p>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default DeveloperGuideDetailPage;
