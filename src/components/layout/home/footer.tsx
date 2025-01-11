import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GrFacebookOption,
  GrInstagram,
  GrTwitter,
  GrYoutube,
} from "react-icons/gr";

const Footer = () => {
  const [year, setYear] = useState<any>();
  useEffect(() => {
    const y = dayjs().year();
    setYear(y);
  }, []);

  return (
    <footer className="relative mt-10 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-screen-xl p-4 py-6 md:p-8 lg:p-10 lg:py-16">
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700" />
        <div className="text-center">
          <Link
            href="/"
            className="mb-5 flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img
              src="/favicon.ico"
              className="h-6 sm:h-9"
              alt="Landwind Logo"
            />
            <h1 className="p-1 text-xl font-bold text-rose-600">Dashboard</h1>
            {/* <span className="text-xs text-slate-400 mt-1">Global Block</span> */}
          </Link>
          <span className="block text-center text-sm text-gray-400 dark:text-gray-400">
            © {year} PANDI™. All Rights Reserved.
          </span>
          <ul className="mt-5 flex justify-center space-x-5">
            <li>
              <a
                href="https://www.instagram.com/pandi_id"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <GrInstagram className="h-5 w-5" />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/pandi.id"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <GrFacebookOption className="h-5 w-6 font-bold" />
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/pandi_id"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <GrTwitter className="h-5 w-5" />
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/channel/UCn5zGOIEVj1uHftXbn0ZEag"
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <GrYoutube className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
