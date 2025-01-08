import Footer from "./footer";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-wrap min-h-full flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
};
export default HomeLayout;
