import React, { useEffect, useRef } from "react";
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
  const messageRef = useRef(null)
  const { socket } = useSocket();
  
  useEffect(() => {
    if(username === socket.auth.username){
      messageRef.current.classList = "message-self"
    } else{
      messageRef.current.classList = "message-interlocutor"
    }
  })

  const handleTimeHover = (e) => {
    timeRef.current.classList.toggle("opacity-100");
  };

  const maxLineLength = 65; // Adjust to your desired line length

  const messageLines = breakLongMessage(message, maxLineLength);

  return (
    <div
      ref={messageRef}
      onMouseOver={handleTimeHover}
      onMouseOut={handleTimeHover}
      className=""
    >
      <div className="flex flex-col break-words transition-all">
        <span className="font-medium text-pink-400 text-sm">
          {username}
        </span>
        <div className="break-all">
          {messageLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
      <span
        ref={timeRef}
        className="font-medium text-rtca-400 transition-all opacity-0 absolute top-1 text-xs right-1 p-1 rounded-lg bg-rtca-900/25"
      >
        10:30AM
      </span>
    </div>
  );
};

export default Message;
