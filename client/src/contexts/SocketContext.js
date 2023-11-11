import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useConfig } from './ConfigContext';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const config = useConfig();
    const {authToken} = useAuth();

    const authenticateUser = async() => {
        try {
            if(!authToken) {
                //console.error("Authentication token is missing.");
                return
            }

            const newSocket = io(config.socketUri, {autoConnect: false});
            newSocket.auth = {accessToken: authToken}
            newSocket.connect()
            setSocket(newSocket);
            
        } catch (error) {
            console.error("Authentication failed.", error)
        }
    }

  useEffect(() => {
    authenticateUser();
  }, [authToken]);

  // console.log('Socket instance:', socket);

  return (
    <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
  );
};
