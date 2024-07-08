import { Outlet } from "react-router-dom";
import HomePageProvider from "./context/HomePageProvider";
import Playground from "./pages/Playground";
import { useAppWrapper } from "./context/AppWrapperProvider";
import NavBar from "./component/NavBar";
import { useLayoutEffect, useRef } from "react";
import { PlaygroundProvider } from "./pages/Playground/PlaygroundContext";

const Layout = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const { playgroundRef } = useAppWrapper();
  useLayoutEffect(() => {
    if (homeRef.current && homeRef.current) {
      homeRef.current.scrollIntoView();
    }
  }, []);
  return (
    <HomePageProvider>
      <section ref={playgroundRef} className="w-full h-full snap-start">
        <PlaygroundProvider>
          <Playground />
        </PlaygroundProvider>
      </section>
      <section ref={homeRef} className="w-full h-full snap-start relative">
        <NavBar />
        <span className="flex-center w-full h-full">
          <Outlet />
        </span>
      </section>
    </HomePageProvider>
  );
};

export default Layout;
