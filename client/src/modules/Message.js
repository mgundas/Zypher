import React, { useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

const Message = ({username, message, timestamp}) => {
  const timeRef = useRef(null);
  const { socket } = useSocket();

  const handleTimeHover = (e) => {
    timeRef.current.classList.toggle("opacity-0");
  };

  return (
    <div
      onMouseOver={handleTimeHover}
      onMouseOut={handleTimeHover}
      className="flex items-center justify-between"
    >
      <div className="flex gap-2 hover:translate-x-1 break-words transition-all">
        <span className="font-medium">{username === socket.auth.username ? username  + " (You)" : username}:</span>
        <p>{message}</p>
      </div>
      <span
        ref={timeRef}
        className="font-medium text-rtca-500 opacity-0 transition-all"
      >
        {timestamp}
      </span>
    </div>
  );
}

export default Message;
