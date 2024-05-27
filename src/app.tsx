import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarLoader } from "react-spinners";
import { ROOTURL } from "./api/client";
import { useStore } from "./store/store";

const root = createRoot(document.getElementById("root"));

function App() {
  const { addSysInfo } = useStore((state) => state);

  useEffect(() => {
    ROOTURL;
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
