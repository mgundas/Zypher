import React, {lazy, Suspense} from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, Link, Outlet } from 'react-router-dom';
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { RecipientProvider } from "./contexts/RecipientContext";

import { LoadingOverlay } from "./components/LoadingOverlay";

const LazyHome = lazy(() => import("./App"))

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <LanguageProvider>
      <ConfigProvider>
        <AuthProvider>
          <SocketProvider>
            <RecipientProvider>
              <LoadingOverlay>
                <Suspense fallback={<div>Loading...</div>}>
                  <LazyHome />
                  </Suspense>
              </LoadingOverlay>
            </RecipientProvider>
          </SocketProvider>
        </AuthProvider>
      </ConfigProvider>
    </LanguageProvider>
  </Router>
);