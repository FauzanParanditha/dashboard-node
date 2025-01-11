import { useDashboardContext } from "../Provider";
import css from "../style.module.css";
import { SidebarHeader } from "./sidebarHeader";
import { SidebarItems } from "./sidebarItems";

interface SidebarProps {
  mobileOrientation: "start" | "end";
}

const style = {
  mobileOrientation: {
    start: "right-0",
    end: "left-0",
  },
  container: "pb-32 lg:pb-6",
  close: "hidden lg:block lg:w-64 lg:z-auto",
  open: "w-8/12 absolute z-40 sm:w-5/12 lg:hidden",
  default:
    "bg-white h-screen overflow-y-auto top-0 lg:relative rounded-r-lg dark:bg-black",
};

export function Sidebar(props: SidebarProps) {
  const { sidebarOpen } = useDashboardContext();
  return (
    <div
      className={`${style.default} ${
        style.mobileOrientation[props.mobileOrientation]
      } ${sidebarOpen ? style.open : style.close} ${css.scrollbar}`}
    >
      <div className={style.container}>
        <SidebarHeader />
        <SidebarItems />
      </div>
    </div>
  );
}
