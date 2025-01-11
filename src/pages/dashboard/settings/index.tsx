import UpdateProfile from "@/components/dashboard/settings/Profile";
import ChangePasswordProfile from "@/components/dashboard/settings/changePassword";
import { DashboardLayout } from "@/components/layout";
import Head from "next/head";

const SettingsPage = () => {
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
        </div>
      </DashboardLayout>
    </>
  );
};

export default SettingsPage;
