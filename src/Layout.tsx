import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";
import NavBar from "./component/NavBar";

const Layout = () => {
  return (
    <HomePageProvider>
      <section className="w-full h-full">
        <div className="draggable-nav absolute top-0 left-0 right-0 h-[20px] bg-transparent z-10" />
        <NavBar />
        <span className="flex-center w-full h-full">
          <Outlet />
        </span>
      </section>
    </HomePageProvider>
  );
};

export default Layout;
