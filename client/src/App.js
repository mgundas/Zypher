import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import ToggleDarkMode from "./modules/ToggleDarkMode";
import Message from "./modules/Message";
import ChatInput from "./modules/ChatInput";
import Login from "./modules/Login";
import Register from "./modules/Register";
import { useConfig } from "./contexts/ConfigContext";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { socket } = useSocket();
  const config = useConfig();
  const {loggedIn} = useAuth();

  const infoBoxRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const infoTimeoutRef = useRef(null);
  const bottomRef = useRef(null);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState("Online");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.title = config.appName;
  }, []);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        if (data.sender !== socket.auth.username) {
          document.title = "New message!";
        }
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
          document.title = config.appName;
        }, 2000);
      };

      const handleUserTyping = (data) => {
        if (data.username === socket.auth.username) {
          return;
        } else {
          setStatus("Typing...");
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.username === socket.auth.username) {
          return;
        } else {
          setStatus("Online");
        }
      };

      socket.on("user typing", handleUserTyping);
      socket.on("user stopped typing", handleUserStoppedTyping);
      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("user typing", handleUserTyping);
        socket.off("user stopped typing", handleUserStoppedTyping);
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, messages]);

  const sendInfoMessage = (message, type) => {
    const types = {
      success: "dark:bg-green-900 bg-green-700",
      failure: "dark:bg-red-900 bg-rt-800",
      warning: "dark:bg-yellow-600 bg-yellow-500",
      info: "dark:bg-teal-900 bg-teal-700",
    };

    infoBoxRef.current.className = `info-box ${types[type]}`;
    setErrorMsg(message);
    infoBoxRef.current.classList.remove("hidden");

    clearTimeout(infoTimeoutRef.current);
    infoTimeoutRef.current = setTimeout(() => {
      infoBoxRef.current.classList.add("hidden");
    }, 2000);
  };

  const renderContent = () => {
    if (loggedIn && socket) {
      return (
        <>
          <div
            ref={sidebarRef}
            className="sidebar -translate-x-60 w-60"
          >
            <div className="p-5 font-medium text-center">Conversations</div>
            <div className="flex flex-col">
              <button className="p-4 flex gap-2 items-center hover:bg-rtca-500/50 transition-all">
                <img
                  src="https://via.placeholder.com/512x512"
                  className="h-10 w-10 rounded-full"
                />
                <div className="grid grid-rows-2 text-sm">
                  <div className="font-medium text-left">Mehmet</div>
                  <span className="">How have things been...</span>
                </div>
              </button>
              <button className="p-4 flex gap-2 items-center hover:bg-rtca-500/50 transition-all">
                <img
                  src="https://via.placeholder.com/512x512"
                  className="h-10 w-10 rounded-full"
                />
                <div className="grid grid-rows-2 text-sm">
                  <div className="font-medium text-left">Mehmet</div>
                  <span className="">How have things been...</span>
                </div>
              </button>
            </div>
          </div>
          <div
            ref={overlayRef}
            onClick={() => {
              sidebarRef.current.classList.add("-translate-x-60");
              overlayRef.current.classList.add("hidden");
            }}
            className="h-screen w-screen absolute bg-rtca-800/50 z-10 hidden"
          ></div>
          <div className="chat-screen">
            <nav className="navbar">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    sidebarRef.current.classList.remove("-translate-x-60");
                    overlayRef.current.classList.remove("hidden");
                  }}
                  className="rounded-full h-10 w-10 hover:bg-rtca-600/50 transition-all"
                >
                  <i className="bi bi-list"></i>
                </button>
                <div className="p-4 flex gap-2 items-center">
                  <img
                    src="https://via.placeholder.com/512x512"
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex flex-col text-sm">
                    <button className="font-medium">Mehmet</button>
                    <span className="text-green-500 select-none">{status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <ul className="flex gap-3 font-medium items-center">
                  <ToggleDarkMode />
                </ul>
              </div>
            </nav>
            <div className="flex-1 flex flex-col gap-1 items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white">
              <div className="time-divider">
                Today
              </div>
              {messages.map((message, key) => (
                <Message
                  key={key}
                  username={message.sender}
                  message={message.message}
                  timestamp="31.10.2023 6:27PM"
                />
              ))}
              <div ref={bottomRef} className="opacity-0 content-none"></div>
            </div>
            <ChatInput />
          </div>
        </>
      );
    } else {
      return (
        <div className="z-10 dark:text-white grid gap-5 mb-10 mt-10 md:mt-20 items-center">
          <h1 className="row-span-2 text-2xl text-center font-medium">
            {config.appName}
          </h1>
          {config.notice.visible ? (
            <div className="justify-self-center border-l-4 mx-5 md:mx-0 flex-wrap gap-1 border-teal-900 dark:border-teal-600 text-white dark:text-rtca-50 p-3 transition-all rounded-md bg-teal-700 dark:bg-teal-900 flex">
              <h1 className="font-medium">{config.notice.title}</h1>
              <h2>{config.notice.message}</h2>
            </div>
          ) : (
            <></>
          )}
          <div ref={infoBoxRef} className="hidden">
            {errorMsg}
          </div>
          <div className="row-span-1 flex flex-row flex-wrap gap-10 items-center justify-center">
            <Login
              sendInfoMessage={sendInfoMessage}
            />
            <div className="hidden sm:flex">or</div>
            <Register sendInfoMessage={sendInfoMessage} />
          </div>
        </div>
      );
    }
  };

  return <div>{renderContent()}</div>;
}

export default App;
