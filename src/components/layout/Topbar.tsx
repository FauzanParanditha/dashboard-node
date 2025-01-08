import { useDashboardContext } from "@/components/layout/Provider";
import UserMenu from "./header/Usermenu";

export function TopBar() {
  const { toggleSidebar } = useDashboardContext();
  return (
    <header className="relative z-10 h-16 w-full items-center bg-white shadow md:h-20 lg:rounded-2xl">
      <div className="relative mx-auto flex h-full flex-col justify-center px-3">
        <div className="relative flex w-full items-center pl-1 sm:ml-0 sm:pr-2">
          <div className="relative left-0 flex h-full w-3/4">
            <div className="group relative flex h-full w-12 items-center">
              <button
                type="button"
                aria-expanded="false"
                aria-label="Toggle sidenav"
                className="text-4xl text-gray-500 focus:outline-none"
                onClick={toggleSidebar}
              >
                &#8801;
              </button>
            </div>
          </div>
          <div className="relative ml-5 flex w-1/4 items-center justify-end p-1 sm:right-auto sm:mr-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
