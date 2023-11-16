import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useConfig } from "./ConfigContext";
import { useAuth } from "./AuthContext";

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
  const { authToken } = useAuth();

  useEffect(() => {
    try {
      if (!authToken) {
        //console.error("Authentication token is missing.");
        return;
      }
      // Create a new socket instance and connect it using the provided authentication token.
      const newSocket = io(config.socketUri, { autoConnect: false });
      newSocket.auth = { accessToken: authToken };
      newSocket.connect();
      setSocket(newSocket);

      return () => newSocket.close()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Socket connection failed:", error);
      }
    }
  }, [authToken, config.socketUri]);

  // console.log('Socket instance:', socket);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
