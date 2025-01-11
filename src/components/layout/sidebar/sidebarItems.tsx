import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { admin } from "./data";

const style = {
  title: "font-normal mx-4 text-sm",
  active:
    "bg-gradient-to-r border-r-4 border-rose-600 from-white to-cyan-100 text-blue-500 dark:text-black",
  link: "duration-200 flex font-thin items-center justify-start my-2 p-4 transition-colors text-gray-500 dark:text-white uppercase w-full font-semibold lg:hover:text-blue-600 dark:text-white",
  subLink:
    "duration-200 flex font-thin items-center justify-start my-2 p-4 transition-colors text-gray-400 dark:text-white uppercase w-full font-medium lg:hover:text-blue-600",
};

export function SidebarItems() {
  const { pathname } = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  let sidebarData = admin;
  let rem = "";

  if (pathname.startsWith("/__adm")) {
    sidebarData = admin;
    rem = "/__adm";
  }
  const active = pathname.replace(rem, "");

  useEffect(() => {
    // Check if any submenu item is active and set dropdownOpen accordingly
    sidebarData.forEach((item) => {
      if (item.subMenu) {
        item.subMenu.forEach((subItem) => {
          if (active === subItem.link) {
            setDropdownOpen(true);
          }
        });
      }
    });
  }, [active, sidebarData]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <ul>
      {sidebarData.map((item) => (
        <li key={item.title} className="animate-fade-down animate-delay-100">
          {item.subMenu ? (
            <>
              <div
                className={`${style.link} ${dropdownOpen ? style.active : ""}`}
                onClick={toggleDropdown}
              >
                <span>{item.icon}</span>
                <span className={style.title}>{item.title}</span>
              </div>
              {dropdownOpen && (
                <ul className="pl-4">
                  {item.subMenu.map((subItem) => (
                    <li key={subItem.title}>
                      <Link href={subItem.link}>
                        <span
                          className={`${style.subLink} ${
                            active === subItem.link ? style.active : ""
                          }`}
                        >
                          <span>{subItem.icon}</span>
                          <span className={style.title}>{subItem.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Link href={item.link}>
              <span
                className={`${style.link} ${
                  active.startsWith(item.link) ? style.active : ""
                }`}
              >
                <span>{item.icon}</span>
                <span className={style.title}>{item.title}</span>
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
