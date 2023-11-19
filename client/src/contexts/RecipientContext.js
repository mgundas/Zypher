import React, { createContext, useContext, useState, useEffect } from "react";
import { useConfig } from "./ConfigContext";
import { useAuth } from "./AuthContext";

const RecipientContext = createContext();

export const useRecipient = () => {
  return useContext(RecipientContext);
};

export const RecipientProvider = ({ children }) => {
  const config = useConfig();
  const { authToken } = useAuth();

  const [recipient, setRecipient] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [recipientData, setRecipientData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${config.apiUri}/fetchRecipient?recipient=${recipient}`,
          {
            method: "GET",
            headers: {
              Authorization: `${authToken}`,
            },
          }
        );
        const data = await response.json();
        setRecipientData(data);
        setActiveChat(data.id)
      } catch (error) {
        console.log("An error occured.", error);
      }
    };
    if (recipient) {
      fetchUser();
    }
  }, [recipient]);

  return (
    <RecipientContext.Provider value={{ recipientData, setRecipient, activeChat, setActiveChat }}>
      {children}
    </RecipientContext.Provider>
  );
};
