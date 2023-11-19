import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./contexts/SocketContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RecipientProvider } from "./contexts/RecipientContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ConfigProvider>
    <AuthProvider>
      <SocketProvider>
        <RecipientProvider>
          <App />
        </RecipientProvider>
      </SocketProvider>
    </AuthProvider>
  </ConfigProvider>
);
