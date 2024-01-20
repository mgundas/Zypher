import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { RecipientProvider } from "./contexts/RecipientContext";

import App from "./App";
import { LoadingOverlay } from "./components/LoadingOverlay";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LanguageProvider>
    <ConfigProvider>
      <AuthProvider>
        <SocketProvider>
          <RecipientProvider>
            <LoadingOverlay>
              <App />
            </LoadingOverlay>
          </RecipientProvider>
        </SocketProvider>
      </AuthProvider>
    </ConfigProvider>
  </LanguageProvider>
);