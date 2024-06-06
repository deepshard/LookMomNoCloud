import React from "react";
import NavBar from "./component/NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <section>
        <NavBar />
      </section>
      <section>
        <Outlet />
      </section>
    </div>
  );
};

export default Layout;
