import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { useEffect, useState } from "react";
import useStore from "./store";
import axios from "axios";
import { BarLoader } from "react-spinners";

const root = createRoot(document.getElementById("root"));

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const setSocket = useStore((state) => state.setSocket);
  const parseResponse = useStore((state) => state.parseResponse);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.134:8899/");
    socket.onopen = () => {
      console.log("[ws connected]");
      setSocket(socket);
      setLoading(false);
    };

    socket.onmessage = (event) => {
      parseResponse(event.data);
    };

    socket.onclose = () => {
      console.log("[ws disconnected]");
      setLoading(true);
      setSocket(null);
    };

    socket.onerror = (error) => {
      console.log("[ws error]", error);
      setSocket(null);
      setError(error);
      setLoading(false);
    };

    return () => {
      setSocket(null);
      setError(null);
      socket.close();
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
