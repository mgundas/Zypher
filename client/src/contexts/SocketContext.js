import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useConfig } from "./ConfigContext";
import { useAuth } from "./AuthContext";
import { useSelector } from 'react-redux'

if (!io) {
  throw new Error("Socket.io client library not found. Make sure it's installed.");
}

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const config = useConfig();
  const { accessToken } = useSelector(state => state.auth)

  useEffect(() => {
    try {
      if (!accessToken) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`SocketContext: Access token is missing.`);
       }
        return;
      }
      // Create a new socket instance and connect it using the provided authentication token.
      const newSocket = io(config.socketUri, { autoConnect: false });
      newSocket.auth = { accessToken: accessToken };
      newSocket.connect();
      setSocket(newSocket);

      return () => newSocket.close()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("SocketContext: Connection failed:", err);
      }
    }
  }, [accessToken, config.socketUri]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
