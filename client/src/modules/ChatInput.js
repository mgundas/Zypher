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
        sender: socket.auth.username,
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
          className="flex grow p-2 rounded-full px-5 z-[1] border-none bg-rtca-300 dark:text-rtca-100 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSubmit}
          type="submit"
          className="bg-green-700 p-2 px-4 text-white rounded-full hover:bg-green-800 active:bg-green-900 focus:outline-0 focus:ring-4 focus:ring-green-800/50 transition-all"
        >
          <i class="bi bi-send"></i>
        </button>
      </form>
    </>
  );
}

export default ChatInput;
