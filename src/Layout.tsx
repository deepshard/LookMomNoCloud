import React from "react";
import NavBar from "./component/NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <section className="mb-[71.2px]">
        <NavBar />
      </section>
      <section className="">
        <Outlet />
      </section>
    </div>
  );
};

export default Layout;
