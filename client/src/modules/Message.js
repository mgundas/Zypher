import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { breakLongMessage } from "../helpers/wordBreaker";
import { convertTime } from "../helpers/timeConverter";

const Message = ({ message, isLastMessage, id }) => {
  const timeRef = useRef(null);
  const messageRef = useRef(null);
  const usernameRef = useRef(null);

  const { userData } = useAuth();
  const { socket } = useSocket();

  const [isSelf, setIsSelf] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isBrowserFocused, setIsBrowserFocused] = useState(true);

  const maxLineLength = 65; // Adjust to your desired line length
  const messageLines = breakLongMessage(message.message, maxLineLength);

  useEffect(() => {
    if (message.sender === userData.username) {
      const randomColor = generateRandomColor(userData.username);
      usernameRef.current.classList.add(`text-[${randomColor}]`);
      setIsSelf(true);
    } else {
      const randomColor = generateRandomColor(message.sender);
      usernameRef.current.classList.add(`text-[${randomColor}]`);
      setIsSelf(false);
    }
  }, [message.sender, userData.username]);

  const handleTimeHover = (e) => {
    timeRef.current.classList.toggle("opacity-100");
  };

  const isMessageVisibleInViewport = () => {
    const messageElement = messageRef.current;
    if (messageElement) {
      const rect = messageElement.getBoundingClientRect();
      // Check if the message element is within the vertical viewport
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }
    // Message element not found
    return false;
  };

  // Attach the event listener to the chat window's scroll event
  useEffect(() => {
    const handleMessageSeen = (messageId) => {
      // Assume you have the message ID
      console.log("triggered");
      socket.emit("messageSeen", { recipient: message.sender, id: messageId });
    };

    const handleVisibility = () => {
      if (
        isMessageVisibleInViewport() &&
        !hasBeenSeen &&
        !isSelf &&
        isBrowserFocused &&
        isTabVisible
      ) {
        handleMessageSeen(id);
        setHasBeenSeen(true);
      }
    };

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
      handleVisibility();
    };

    const handleWindowFocus = () => {
      setIsBrowserFocused(true);
      handleVisibility();
    };

    const handleWindowBlur = () => {
      setIsBrowserFocused(false);
    };

    if (isLastMessage && !isSelf) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleWindowFocus);
      window.addEventListener("blur", handleWindowBlur);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    isLastMessage,
    hasBeenSeen,
    isSelf,
    id,
    isBrowserFocused,
    isTabVisible,
    message.sender,
    socket,
  ]);

  return (
    <div
      ref={messageRef}
      onMouseOver={handleTimeHover}
      onMouseOut={handleTimeHover}
      className={isSelf ? "message-self" : "message-interlocutor"}
    >
      <div className="flex relative flex-col break-words transition-all">
        <span ref={usernameRef} className="font-medium text-sm">
          {message.sender}
        </span>
        <div className="break-all">
          {messageLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
      <span
        ref={timeRef}
        className="font-medium text-rtca-400 opacity-0 transition-all absolute -bottom-3 text-xs -right-3 z-[1] p-1 rounded-full bg-rtca-800/25"
      >
        {convertTime(message.timestamp)}
      </span>
    </div>
  );
};

export default Message;
