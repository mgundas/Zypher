import React, {useState, useRef, useEffect} from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import { useSocket } from "../contexts/SocketContext";
import { useConfig } from "../contexts/ConfigContext";
import { useAuth } from "../contexts/AuthContext";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { getInitials } from "../helpers/getInitials";

export const ChatWindow = ({
  messages,
  activeChat
}) => {
  const { socket } = useSocket();
  const config = useConfig();
  const { userData } = useAuth();

  const bottomRef = useRef(null);
  const chatWindow = useRef(null);

  const [filteredMessages, setFilteredMessages] = useState([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  useEffect(() => {
    const filtered = messages.filter((message) => {
      if (
        message.sender === activeChat &&
        message.recipient === userData.username
      ) {
        return message.sender === activeChat;
      } else if (
        message.sender === userData.username &&
        message.recipient === activeChat
      ) {
        return message.recipient === activeChat;
      } else {
        return null;
      }
    });
    setFilteredMessages(filtered);
  }, [messages, activeChat, userData.username]);

  return (
    <>
      <div
        ref={chatWindow}
        className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
      >
        <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
          Please do not share your password or personal information.
        </div>
        {/* <div className="time-divider">Today</div> */}
        {filteredMessages.map((message, index, array) => (
          <Message
            key={index}
            id={message.id}
            message={message}
            isLastMessage={index === array.length - 1}
          />
        ))}
        <div ref={bottomRef} className="opacity-0 content-none"></div>
      </div>
      <ChatInput recipient={activeChat} />
    </>
  );
};
