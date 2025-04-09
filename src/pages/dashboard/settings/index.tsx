import api, { handleAxiosError } from "@/api";
import Button from "@/components/button";
import UpdateProfile from "@/components/dashboard/settings/Profile";
import ChangePasswordProfile from "@/components/dashboard/settings/changePassword";
import ModalVerification from "@/components/dashboard/settings/modalVerification";
import { DashboardLayout } from "@/components/layout";
import { useUserContext } from "@/context/user";
import useStore from "@/store";
import { checkAuthAdmin } from "@/utils/server";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-toastify";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Use the checkAuth function to handle authentication
  return checkAuthAdmin(context);
};

const SettingsPage = () => {
  const { setIsLoading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const { user } = useUserContext();

  const handleSend = (email: string) => {
    setIsLoading(true);
    setSelectedEmail(email);

    api()
      .patch("/adm/auth/send-verification-code", {
        email: email,
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message, { theme: "colored" });
        }
      })
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsModalOpen(true);
      });
  };
  return (
    <>
      <Head>
        <title>Profile Settings</title>
      </Head>
      <DashboardLayout>
        <h4 className="my-4 text-2xl font-bold text-slate-500 dark:text-white">
          Update Profile
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50">
            <div className="container mx-auto">
              <div className="max-w-full overflow-x-auto rounded-lg">
                <UpdateProfile />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50">
            <div className="container mx-auto">
              <div className="max-w-full overflow-x-auto rounded-lg">
                <ChangePasswordProfile />
              </div>
            </div>
          </div>
          {user?.verified ? (
            <></>
          ) : (
            <div className="rounded-2xl bg-slate-50">
              <div className="container mx-auto">
                <div className="max-w-full overflow-x-auto rounded-lg">
                  <div className="grid grid-cols-12">
                    <div className="col-span-full rounded-md bg-white p-4 shadow-lg xl:col-span-12 dark:border-slate-600 dark:bg-black dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-slate-600">
                      <h2 className="text-xl font-semibold text-slate-500 dark:text-white">
                        Verification
                      </h2>
                      <div className="border-b-2 border-slate-400 dark:border-red-900"></div>
                      <div className="my-2 grid grid-cols-2">
                        <Button
                          danger
                          label="Send Verification Code"
                          block
                          bold
                          onClick={() => {
                            handleSend(user?.email);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ModalVerification
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            email={selectedEmail}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default SettingsPage;
