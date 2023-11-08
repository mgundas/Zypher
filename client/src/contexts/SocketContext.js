import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useConfig } from './ConfigContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [auth, setAuth] = useState(localStorage.getItem("accessToken") ? {accessToken: localStorage.getItem("accessToken")} : "" );
    const config = useConfig();

    const authenticateUser = async() => {
        try {
            if(!auth) {
                //console.error("Authentication token is missing.");
                return
            }

            const newSocket = io(config.socketUri, {autoConnect: false});
            newSocket.auth = auth
            newSocket.connect()
            setSocket(newSocket);
            
        } catch (error) {
            console.error("Authentication failed.", error)
        }
    }

  useEffect(() => {
    authenticateUser();
  }, [auth]);

  // console.log('Socket instance:', socket);

  return (
    <SocketContext.Provider value={{socket, setAuth}}>{children}</SocketContext.Provider>
  );
};
