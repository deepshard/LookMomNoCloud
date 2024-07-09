import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";
import NavBar from "./component/NavBar";

const Layout = () => {
  return (
    <HomePageProvider>
      <section className="w-full h-full snap-start relative">
        <NavBar />
        <span className="flex-center w-full h-full">
          <Outlet />
        </span>
      </section>
    </HomePageProvider>
  );
};

export default Layout;
