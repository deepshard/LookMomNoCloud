import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import useSysInfo from "./hooks/useSysInfo";
import { useStore } from "./store/store";
import { ROOTURL } from "./api/client";

const root = createRoot(document.getElementById("root"));

function App() {
  const { addSysInfo } = useStore();
  useSysInfo({
    rootUrl: ROOTURL,
    addSysInfo,
  });

  return (
    <div>
      <Toaster />
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

root.render(<App />);
