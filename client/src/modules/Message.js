import React, { useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

function breakLongMessage(message, maxLineLength) {
  const lines = [];
  while (message.length > maxLineLength) {
    lines.push(message.substring(0, maxLineLength));
    message = message.substring(maxLineLength);
  }
  lines.push(message); // Add the remaining part or the last line
  return lines;
}

const Message = ({ username, message, timestamp }) => {
  const timeRef = useRef(null);
  const { socket } = useSocket();

  const handleTimeHover = (e) => {
    timeRef.current.classList.toggle("opacity-0");
  };

  const maxLineLength = 65; // Adjust to your desired line length

  const messageLines = breakLongMessage(message, maxLineLength);

  return (
    <div
      onMouseOver={handleTimeHover}
      onMouseOut={handleTimeHover}
      className="flex items-center justify-between bg-rtca-600 p-2 rounded-lg"
    >
      <div className="flex flex-col gap-2 hover:translate-x-1 break-words transition-all">
        <span className="font-medium break-words">
          {username === socket.auth.username ? username + " (You)" : username}:
        </span>
        <p className="break-all">
          {messageLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </p>
      </div>
      <span
        ref={timeRef}
        className="font-medium text-rtca-500 opacity-0 transition-all"
      >
        {timestamp}
      </span>
    </div>
  );
};

export default Message;
