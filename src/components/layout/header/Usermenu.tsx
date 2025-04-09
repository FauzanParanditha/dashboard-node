import api, { handleAxiosError } from "@/api";
import Transition from "@/components/Transition";
import { useUserContext } from "@/context/user";
import useStore from "@/store";
import { jwtConfig } from "@/utils/var";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FiLogOut } from "react-icons/fi";

function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { setIsLoading } = useStore();
  const router = useRouter();

  // close on click outside
  useEffect(() => {
    const clickHandler = (event: any) => {
      const { target } = event;
      if (
        !dropdownOpen ||
        dropdown.current?.contains(target) ||
        trigger.current?.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (event: any) => {
      const { keyCode } = event;
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const Logout = () => {
    deleteCookie(jwtConfig.admin.accessTokenName);
    setIsLoading(true);
    api()
      .post("/adm/auth/logout")
      .catch((err) => {
        handleAxiosError(err);
      })
      .finally(() => setIsLoading(false));
    window.location.href = "/auth/login";
  };
  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="group inline-flex items-center justify-center"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img
          className="h-8 w-8 rounded-full"
          src="/images/avatar.png"
          width="32"
          height="32"
          alt="User"
        />
        <div className="flex items-center truncate">
          <span className="ml-2 truncate text-sm font-medium group-hover:text-slate-800 dark:text-white dark:group-hover:text-slate-300">
            {user?.fullName}
          </span>
          <svg
            className="ml-1 h-3 w-3 shrink-0 fill-current text-slate-400"
            viewBox="0 0 12 12"
          >
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className="absolute right-0 top-full z-10 mt-1 w-44 origin-top-right overflow-hidden rounded border border-slate-200 bg-white py-1.5 shadow-lg dark:bg-black"
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="mb-1 border-b border-slate-200 px-3 pb-2 pt-0.5">
            <div className="font-medium text-slate-700 dark:text-white">
              {user?.fullName}
            </div>
            <div className="text-xs text-slate-500 dark:text-white">
              {user?.email}
            </div>
          </div>
          <ul>
            <li>
              <button
                className="flex w-full items-center px-3 py-1 text-sm font-medium text-red-800 hover:bg-gray-200 hover:text-red-900 dark:text-slate-200 dark:hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  Logout();
                }}
              >
                <FiLogOut className="text-md h-6 w-6 font-bold" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default UserMenu;
