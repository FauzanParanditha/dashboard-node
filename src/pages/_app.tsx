import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import api from "@/api";
import Loader from "@/components/loading";
import { UserContextProvider } from "@/context/user";
import useStore from "@/store";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { SWRConfig } from "swr";

export default function App({ Component, pageProps }: AppProps) {
  const { isLoading } = useStore();
  return (
    <>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          revalidateOnMount: true,
          refreshWhenHidden: false,
          fetcher: (url) =>
            api()
              .get(url)
              .then(({ data }) => data),
        }}
      >
        <UserContextProvider>
          {isLoading && <Loader />}
          <Component {...pageProps} />;
        </UserContextProvider>
        <ToastContainer
          position="top-center"
          hideProgressBar={false}
          pauseOnFocusLoss={false}
        />
      </SWRConfig>
    </>
  );
}
