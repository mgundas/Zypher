import React, { useState, useRef, useEffect, useCallback } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import { useAuth } from "../contexts/AuthContext";
import { useRecipient } from "../contexts/RecipientContext";
import { useConfig } from "../contexts/ConfigContext";

export const ChatWindow = ({
  messages,
  loading,
  loadedMessages,
  setLoadedMessages,
  setLoading,
  setMessages,
}) => {
  const config = useConfig();
  const { userData, authToken } = useAuth();
  const { recipientData, activeChat, recipient } = useRecipient();

  const bottomRef = useRef(null);
  const loadingRef = useRef(null);
  const chatWindowRef = useRef(null);

  const [filteredMessages, setFilteredMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    if (loading === true) loadingRef.current.classList.remove("invisible");
    if (loading === false) loadingRef.current.classList.add("invisible");
  }, [loading]);

  useEffect(() => {
    const handleLoad = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Add your logic here to handle the fully loaded state
    };

    // Listen for the 'load' event on the window
    window.addEventListener('load', handleLoad);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []); // The empty dependency array ensures the effect runs only once on mount



  useEffect(() => {
    // Check if the user is close to the bottom
    const isCloseToBottom = chatWindowRef.current.scrollHeight - chatWindowRef.current.scrollTop <= chatWindowRef.current.clientHeight + 100;

    // If the user is close to the bottom, scroll to the bottom
    if (isCloseToBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, recipient]);

  useEffect(() => {
    const filtered = messages.filter((message) => {
      if (
        message.sender === recipientData.id &&
        message.recipient === userData.id
      ) {
        return message.sender === recipientData.id;
      } else if (
        message.sender === userData.id &&
        message.recipient === recipientData.id
      ) {
        return message.recipient === recipientData.id;
      } else {
        return null;
      }
    });
    setFilteredMessages(filtered);
  }, [messages, userData.id, recipientData.id]);

  const fetchMessages = useCallback(async (limit, skip) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${config.apiUri}/messages?requester=${userData.id}&recipient=${recipientData.id}&limit=${limit}&skip=${skip}`,
        {
          method: "GET",
          headers: {
            Authorization: `${authToken}`,
          },
        }
      );
      const data = await response.json();

      setMessages((prevMessages) => [...new Set(data.messages), ...new Set(prevMessages)]);
      // setMessages((prevMessages) => [...data.messages, ...prevMessages]);
      setLoadedMessages((prevLoaded) => prevLoaded + data.messages.length);
      setTotalMessages(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [authToken, config.apiUri, recipientData.id, setLoadedMessages, setLoading, setMessages, userData.id]);

  const handleScroll = () => {
    const container = chatWindowRef.current;

    if (
      container.scrollTop === 0 &&
      !loading &&
      loadedMessages < totalMessages
    ) {
      const limit = 10; // Adjust the limit as needed
      const skip = Math.floor(loadedMessages / 10);

      console.log(limit, skip);
      fetchMessages(limit, skip);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(10, 0);
    }
  }, [activeChat, fetchMessages]);
  return (
    <>
      <div
        ref={chatWindowRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
      >
        <div
          ref={loadingRef}
          className="loading loading-spinner loading-lg text-success"
        ></div>
        {/* <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
          Please do not share your password or personal information.
        </div> */}
        {/* <div className="time-divider">Today</div> */}
        {filteredMessages.map((message, index, array) => (
          <Message
            key={index}
            message={message}
            isLastMessage={index === array.length - 1}
          />
        ))}
        <div ref={bottomRef} className="opacity-0 content-none"></div>
      </div>
      <ChatInput />
    </>
  );
};
