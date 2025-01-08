import HomeLayout from "@/components/layout/home";
import ChangePassword from "@/components/reset-password/ChangePassword";
import SendEmail from "@/components/reset-password/SendEmail";
import useStore from "@/store";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ForgotPassword: NextPage = () => {
  const { setIsLoading } = useStore();
  const [isReset, setIsReset] = useState(false);
  const router = useRouter();
  const { email } = router.query;
  const { code } = router.query;
  useEffect(() => {
    setIsLoading(false);
    if (email != undefined || code != undefined) {
      setIsReset(true);
    }
  }, [code, email]);
  return (
    <HomeLayout>
      <Head>
        <title>Reset Page</title>
        <meta name="description" content="reset page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mb-10 mt-20 flex-1 items-center justify-center pt-6 sm:justify-center sm:pt-0">
        <div className="m-auto mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mx-auto flex justify-center">
            <img className="h-8 w-auto sm:h-8" src="/favicon.ico" alt="" />
          </div>
          {isReset ? <ChangePassword /> : <SendEmail />}
        </div>
      </div>
    </HomeLayout>
  );
};
export default ForgotPassword;
