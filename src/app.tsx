import { createRoot } from "react-dom/client";
import Home from "./Home";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import QueryProvider from "./lib/react-query/QueryProvider";
import ModelDetailView from "./pages/ModelDetailView";
import AppWrapperProvider from "./context/AppWrapperProvider";
import OTA from "./pages/OTA";
import Playground from "./pages/Playground";

// @ts-ignore
const root = createRoot(document.getElementById("root"));

function App() {
  return (
    <div>
      <div className="clear-dotted-bg" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="scrollable w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
          <HashRouter>
            <QueryProvider>
              <AppWrapperProvider>
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                  </Route>
                  <Route path="/model/:id" element={<ModelDetailView />} />
                  <Route path="/initialization" element={<OTA initialization={true} />} />
                  <Route path="/update" element={<OTA initialization={false} />} />
                </Routes>
              </AppWrapperProvider>
            </QueryProvider>
          </HashRouter>
        </div>
      </div>
    </div>
  );
}

root.render(<App />);
