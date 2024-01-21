import React, { createContext, useContext } from "react";

const ConfigContext = createContext();

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
  const config = {
    appName: "Zypher",
    socketUri: process.env.REACT_APP_SOCKET_URI,
    apiUri: process.env.REACT_APP_API_URI,
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
