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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const setSocket = useStore((state) => state.setSocket);
  // const parseResponse = useStore((state) => state.parseResponse);
  const { addSysInfo, sysInfo } = useStore((state) => state);

  // useEffect(() => {
  //   const socket = new WebSocket("ws://0.0.0.0:8899/");
  //   socket.onopen = () => {
  //     console.log("[ws connected]");
  //     setSocket(socket);
  //     setLoading(false);
  //   };

  //   socket.onmessage = (event) => {
  //     parseResponse(event.data);
  //   };

  //   socket.onclose = () => {
  //     console.log("[ws disconnected]");
  //     setLoading(true);
  //     setSocket(null);
  //   };

  //   socket.onerror = (error) => {
  //     console.log("[ws error]", error);
  //     setSocket(null);
  //     setError(error);
  //     setLoading(false);
  //   };

  //   return () => {
  //     setSocket(null);
  //     setError(null);
  //     socket.close();
  //   };
  // }, []);

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

  // if (loading) {
  //   return <BarLoader color="white" />;
  // }

  // if (error) {
  //   return (
  //     <div>
  //       Connection Error. Please contact <code>support@deepshard.org</code>.
  //     </div>
  //   );
  // }

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
