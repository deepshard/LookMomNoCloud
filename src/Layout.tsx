import NavBar from "./component/NavBar";
import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";

const Layout = () => {
  return (
    <>
      <HomePageProvider>
        <section>
          <NavBar />
        </section>
        <section>
          <Outlet />
        </section>
      </HomePageProvider>
    </>
  );
};

export default Layout;
