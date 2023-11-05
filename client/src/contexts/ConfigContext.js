import React, { createContext, useContext } from "react";

const ConfigContext = createContext();

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
  const config = {
    appName: "Comuconnect",
    apiUri: "http://10.15.2.200:80/api/v1",
    notice: {
        visible: true,
        title: "Welcome aboard!",
        message: "Comuconnect is finally online!"
    }
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
