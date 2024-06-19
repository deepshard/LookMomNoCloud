import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import useSysInfo from "./hooks/sysInfo/useSysInfo";
import { useStore } from "./store/store";
import { LOCAL_ROOT_URL } from "./api/client";
import QueryProvider from "./lib/react-query/QueryProvider";

const root = createRoot(document.getElementById("root"));

function App() {
  const { addSysInfo } = useStore();
  useSysInfo({
    rootUrl: LOCAL_ROOT_URL,
    addSysInfo,
    EventSourceFactory: EventSource,
  });

  return (
    <div>
      <div className="app-body">
        <Toaster />
        <HashRouter>
          <QueryProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
              </Route>
            </Routes>
          </QueryProvider>
        </HashRouter>
      </div>
    </div>
  );
}

root.render(<App />);
