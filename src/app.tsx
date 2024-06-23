import { createRoot } from "react-dom/client";
import Home from "./Home";
import { Toaster } from "react-hot-toast";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import QueryProvider from "./lib/react-query/QueryProvider";
import ModelDetailView from "./pages/ModelDetailView";
import AppWrapperProvider from "./context/AppWrapperProvider";

const root = createRoot(document.getElementById("root"));

function App() {
  return (
    <div>
      <div className="app-body">
        <Toaster />
        <HashRouter>
          <QueryProvider>
            <AppWrapperProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/model/:id" element={<ModelDetailView />} />
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
