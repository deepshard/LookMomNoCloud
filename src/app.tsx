import { createRoot } from "react-dom/client";
import Home from "./Home";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import QueryProvider from "./lib/react-query/QueryProvider";
import ModelDetailView from "./pages/ModelDetailView";
import AppWrapperProvider from "./context/AppWrapperProvider";
import OTA from "./pages/OTA";

const root = createRoot(document.getElementById("root"));

function App() {
  return (
    <div>
      <div className="app-body">
        <div className="clear-dotted-bg"/>
        <HashRouter>
          <QueryProvider>
            <AppWrapperProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/model/:id" element={<ModelDetailView />} />
                  <Route path="/initialization" element={<OTA initialization={true} />} />
                  <Route path="/update" element={<OTA initialization={false} />} />
                </Route>
              </Routes>
            </AppWrapperProvider>
          </QueryProvider>
        </HashRouter>
      </div>
    </div>
  );
}

root.render(<App />);
