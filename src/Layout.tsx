import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";

const Layout = () => {
  return (
    <>
      <HomePageProvider>
        {/* <section>
          <NavBar />
        </section> */}
        <section className="flex-1 flex-center">
          <div className="draggable-nav absolute top-0 left-0 right-0 h-[20px] bg-transparent z-10" />
          <Outlet />
        </section>
      </HomePageProvider>
    </>
  );
};

export default Layout;
