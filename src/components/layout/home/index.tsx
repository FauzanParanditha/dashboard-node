import Footer from "./footer";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-full flex-col flex-wrap bg-white dark:bg-gray-800">
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default HomeLayout;
