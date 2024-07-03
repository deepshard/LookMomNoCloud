import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";
import Playground from "./pages/Playgorund";

const Layout = () => {
  return (
    <HomePageProvider>
      <Playground />
      <section className="flex-1 flex-center">
        {/* <Outlet /> */}
      </section>
    </HomePageProvider>
  );
};

export default Layout;
