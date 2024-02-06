import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from 'react-redux'

if (!io) {
  if(process.env.NODE_ENV === 'development') throw new Error("Socket.io client library not found. Make sure it's installed.");
}

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { accessToken } = useSelector(state => state.auth)
  const { socketUri } = useSelector(state => state.globals)

  useEffect(() => {
    try {
      if (!accessToken) {
        if (process.env.NODE_ENV === 'development') console.error(`SocketContext: Access token is missing.`);
        return;
      }
      // Create a new socket instance and connect it using the provided authentication token.
      const newSocket = io(socketUri, { autoConnect: false });
      newSocket.auth = { accessToken: accessToken };
      newSocket.connect();
      setSocket(newSocket);

      return () => newSocket.close()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error("SocketContext: Connection failed:", err);
    }
  }, [accessToken, socketUri]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
