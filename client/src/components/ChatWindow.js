import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import { useAuth } from "../contexts/AuthContext";
import { useRecipient } from "../contexts/RecipientContext";

export const ChatWindow = ({ messages, chatWindowRef, handleScroll, loading }) => {
  const { userData } = useAuth();
  const { recipientData } = useRecipient();

  const bottomRef = useRef(null);
  const loadingRef = useRef(null)

  const [filteredMessages, setFilteredMessages] = useState([]);

  useEffect(() => {
    if(loading === true) loadingRef.current.classList.remove("invisible")
    if(loading === false) loadingRef.current.classList.add("invisible")
  }, [loading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

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

  return (
    <>
      <div
        ref={chatWindowRef}
        onScroll={handleScroll}
        className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
      >
        <div ref={loadingRef} className="loading loading-spinner loading-lg text-success"></div>
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
