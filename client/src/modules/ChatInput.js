import React, { useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

function ChatInput() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();
  const typingRef = useRef(null);

  if (socket) {
    socket.on("user typing", (data) => {
      if (data.username === socket.auth.username) {
        return;
      } else {
        typingRef.current.classList.add("translate-y-[2.6rem]");
      }
    });

    socket.on("user stopped typing", (data) => {
      if (data.username === socket.auth.username) {
        return;
      } else {
        typingRef.current.classList.remove("translate-y-[2.6rem]");
      }
    });
  }

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
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex grow p-2 rounded-md z-[1] border-none bg-rtca-200 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSubmit}
          type="submit"
          className="bg-green-700 p-2 px-6 text-white rounded-md hover:bg-green-800 active:bg-green-900 focus:outline-0 focus:ring-4 focus:ring-green-800/50 transition-all"
        >
          Send
        </button>
        <div
          ref={typingRef}
          className="text-xs text-rtca-500 dark:text-rtca-300 transition-all duration-500 -z-[0] absolute"
        >
          Someone is typing...
        </div>
      </form>
    </>
  );
}

export default ChatInput;
