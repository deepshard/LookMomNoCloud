import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";

const root = createRoot(document.body);
root.render(
  <div>
    <Toaster />
    <Home />
  </div>
);
