import React from "react";
import NavBar from "./component/NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <section className="">
        <NavBar />
      </section>
      <section className="">
        <Outlet />
      </section>
    </div>
  );
};

export default Layout;
