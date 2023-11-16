import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { breakLongMessage } from "../helpers/wordBreaker";
import { convertTime } from "../helpers/timeConverter";

const Message = ({ message, isLastMessage, id }) => {
  const timeRef = useRef(null);
  const messageRef = useRef(null);
  const seenRef = useRef(null);

  const { userData } = useAuth();
  const { socket } = useSocket();

  useState(() => {
    const handleSeen = (data) => {
      if(data.id === id){
        seenRef.current?.classList.remove("hidden")
      }
    }

    if(socket){
      socket.on("seen", handleSeen)
    }
    return () => {
      socket.off("seen", handleSeen)
    }
  }, [socket])

  const [isSelf, setIsSelf] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isBrowserFocused, setIsBrowserFocused] = useState(true);

  const maxLineLength = 65; // Adjust to your desired line length
  const messageLines = breakLongMessage(message.message, maxLineLength);

  useEffect(() => {
    if (message.sender === userData.username) {
      setIsSelf(true);
    } else {
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
      className={
        isSelf ? "chat self-end chat-end" : "chat self-start chat-start "
      }
    >
      <div className="chat-header items-center pb-1">
        {message.sender}
        <time className="text-xs opacity-50 mx-1">{convertTime(message.timestamp)}</time>
      </div>
      <div className="chat-bubble max-w-full bg-rtca-800">
        {messageLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div ref={seenRef} className="chat-footer opacity-50 hidden">Seen</div>
    </div>
  );
};

export default Message;
