import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { useEffect } from "react";
import { ROOTURL } from "./api/client";
import { useAppStore } from "./store/store";

const root = createRoot(document.getElementById("root"));

function App() {
  const { addSysInfo } = useAppStore();

  useEffect(() => {
    const eventSource = new EventSource(ROOTURL + "/sysinfo");
    eventSource.onmessage = (event) => {
      const newSysInfo = JSON.parse(event.data);
      addSysInfo(newSysInfo);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

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
