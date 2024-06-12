import React from "react";
import NavBar from "./component/NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <section>
        <NavBar />
      </section>
      <section>
        <Outlet />
      </section>
    </>
  );
};

export default Layout;
