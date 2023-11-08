import React, { useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

function ChatInput() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);

    if (text) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing", { username: socket.auth.username });
      }
      // Clear the previous timeout and set a new one
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("stopped typing", { username: socket.auth.username });
      }, 1000); // Adjust the timeout duration as needed
    } else if (isTyping) {
      setIsTyping(false);
      socket.emit("stopped typing", { username: socket.auth.username });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("sendMessage", {
        message: message.trim(),
        recipient: "mgundas"
      });
      // clearTimeout(typingTimeoutRef.current);
      // socket.emit("stopped typing", { username: socket.auth.username });
      setMessage("");
    }
  };

  return (
    <>
      <form className="p-2 bottom-0 md:relative flex gap-2 w-screen" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSubmit}
          type="submit"
          className="chat-send-button"
        >
          <i className="bi bi-send"></i>
        </button>
      </form>
    </>
  );
}

export default ChatInput;
