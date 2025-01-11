import HomeLayout from "@/components/layout/home";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/auth/login");
  }, []);
  return (
    <>
      <Head>
        <title>Home Page</title>
        <meta
          name="description"
          content="Welcome to the home page of My Next.js App!"
        />
      </Head>
      <HomeLayout>
        <div className="mx-auto px-4 py-16 sm:max-w-xl md:max-w-full md:px-24 lg:max-w-screen-xl lg:px-8 lg:py-20">
          <div className="row-gap-8 grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <div className="mb-6 max-w-xl">
                <h2 className="mb-6 max-w-lg font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-none">
                  The quick, brown fox
                  <br className="hidden md:block" />
                  jumps over{" "}
                  <span className="relative px-1">
                    <div className="bg-teal-accent-400 absolute inset-x-0 bottom-0 h-3 -skew-x-12 transform" />
                    <span className="text-deep-purple-accent-400 relative inline-block">
                      a lazy dog
                    </span>
                  </span>
                </h2>
                <p className="text-base text-gray-700 md:text-lg">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae. explicabo.
                </p>
              </div>
              <div className="row-gap-8 grid gap-5 sm:grid-cols-2">
                <div className="border-deep-purple-accent-400 border-l-4 bg-white shadow-sm">
                  <div className="h-full rounded-r border border-l-0 p-5">
                    <h6 className="mb-2 font-semibold leading-5">
                      I&apos;ll be sure to note that in my log
                    </h6>
                    <p className="text-sm text-gray-900">
                      Lookout flogging bilge rat main sheet bilge water nipper
                      fluke to go on account heave down.
                    </p>
                  </div>
                </div>
                <div className="border-deep-purple-accent-400 border-l-4 bg-white shadow-sm">
                  <div className="h-full rounded-r border border-l-0 p-5">
                    <h6 className="mb-2 font-semibold leading-5">
                      A business big enough that it could be listed
                    </h6>
                    <p className="text-sm text-gray-900">
                      Those options are already baked in with this model shoot
                      me an email clear.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                className="h-56 w-full rounded object-cover shadow-lg sm:h-96"
                src="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&amp;cs=tinysrgb&amp;dpr=3&amp;h=750&amp;w=1260"
                alt=""
              />
            </div>
          </div>
        </div>
      </HomeLayout>
    </>
  );
}
