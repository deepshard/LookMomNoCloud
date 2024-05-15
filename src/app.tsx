import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { useEffect } from "react";
import useStore from "./store";

const root = createRoot(document.getElementById("root"));

root.render(
  <App />
);

function App() {
  const { setDownloadProgress, setMemoryUsage } = useStore((state) => state)

  useEffect(() => {
    console.log("Setting up listeners for download progress and memory usage updates...");
    window.ipc.onDownloadProgress((data: { model: string, progress: number}) => {
      setDownloadProgress(data);
    });
    window.ipc.onMemoryUsageUpdate((data: { pid: number, usage: number }) => {
      setMemoryUsage(data);
    });
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

