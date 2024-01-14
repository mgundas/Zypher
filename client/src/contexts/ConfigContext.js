import React, { createContext, useContext } from "react";

const ConfigContext = createContext();

export const useConfig = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
  const config = {
    appName: "Zypher",
    socketUri: "https://api.pyromaniacduck.cloud/",
    apiUri: "https://api.pyromaniacduck.cloud/api/v1",
    notice: {
        visible: false,
        title: "Welcome aboard!",
        message: "Zypher is finally online!"
    }
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
