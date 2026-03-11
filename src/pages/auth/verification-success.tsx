import Button from "@/components/button";
import HomeLayout from "@/components/layout/home";
import Head from "next/head";

const VerificationSuccessPage = () => {
  return (
    <>
      <Head>
        <title>Verification Success</title>
        <meta name="description" content="Account verification successful" />
      </Head>
      <HomeLayout>
        <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
          <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-md dark:bg-black">
            <div className="mx-auto flex justify-center">
              <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
            </div>

            <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">
              Verification Success
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Your account has been verified successfully.
            </p>

            <div className="mt-6">
              <Button danger label="Back to Login" to="/auth/login" block bold />
            </div>
          </div>
        </div>
      </HomeLayout>
    </>
  );
};

export default VerificationSuccessPage;
