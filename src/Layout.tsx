import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";
import Playground from "./pages/Playgorund";
import { useLayoutEffect, useRef } from "react";
import { useAppWrapper } from "./context/AppWrapperProvider";

const Layout = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const { playgroundRef } = useAppWrapper();
  useLayoutEffect(() => {
    if (homeRef.current && homeRef.current) {
      homeRef.current.scrollIntoView();
    }
  },[]);
  return (
    <HomePageProvider>
      <section ref={playgroundRef} className="w-full h-full snap-start">
        <Playground className=" w-full h-full" />
      </section>
      <section ref={homeRef} className=" flex-center w-full h-full snap-start">
        <Outlet />
      </section>
    </HomePageProvider>
  );
};

export default Layout;
