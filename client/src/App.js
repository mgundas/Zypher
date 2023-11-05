import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import ToggleDarkMode from "./modules/ToggleDarkMode";
import Message from "./modules/Message";
import ChatInput from "./modules/ChatInput";
import Login from "./modules/Login";
import Register from "./modules/Register";
import { useConfig } from "./contexts/ConfigContext";

function App() {
  const { socket } = useSocket();
  const config = useConfig();

  const unameRef = useRef(null);
  const infoBoxRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const infoTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    document.title = config.appName;
  }, []);

  useEffect(() => {
    if (socket) {
      const handleReceiveId = (data) => {
        unameRef.current.innerHTML = data.username;
        console.log(data);
      };

      const handleReceiveMessage = (data) => {
        console.log("triggered", data);
        setMessages((prevMessages) => [...prevMessages, data]);
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
        console.log(messages);
        if (data.sender !== socket.auth.username) {
          document.title = "New message!";
        }
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
          document.title = config.appName;
        }, 2000);
      };

      socket.on("receiveId", handleReceiveId);
      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveId", handleReceiveId);
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

    infoBoxRef.current.className = `justify-self-center text-white dark:text-rtca-50 p-3 transition-all rounded-md ${types[type]}`;
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
        <div>
          <nav className="bg-rtca-300 dark:bg-rtca-900 dark:text-rtca-300 flex p-2 px-5 justify-between items-center h-16">
            <div className="flex font-medium">Chat App</div>
            <div className="flex gap-4 items-center">
              <ul className="flex gap-3 font-medium items-center">
                <li className="flex">
                  Welcome,&nbsp;<p ref={unameRef}></p>
                </li>
                <ToggleDarkMode />
              </ul>
            </div>
          </nav>
          <div className="flex m-6 rounded-lg dark:text-rtca-200 gap-2 justify-between">
            <button className="dark:bg-rtca-600 bg-rtca-400 p-3 rounded-lg grow">
              Room 1
            </button>
            <button className="dark:bg-rtca-700 bg-rtca-300 p-3 rounded-lg grow">
              Room 2
            </button>
          </div>
          <div className="p-4 pb-6 m-6 rounded-md bg-rtca-300 dark:bg-rtca-700 dark:text-rtca-200 flex flex-col gap-3">
            <div className="font-medium p-2 bg-rtca-200 dark:bg-rtca-600 rounded-md flex justify-between">
              <span>You're currently in: Room 1</span>
              <span>People online in this room: 1</span>
            </div>
            <div
              className="flex flex-col gap-1 max-h-[600px] overflow-auto overflow-x-hidden"
              ref={chatContainerRef}
            >
              {messages.map((message, key) => (
                <Message
                  key={key}
                  username={message.sender}
                  message={message.message}
                  timestamp="31.10.2023 6:27PM"
                />
              ))}
            </div>
            <ChatInput />
          </div>
        </div>
      );
    } else {
      return (
        <div className="z-10 dark:text-white grid gap-5 mb-10 mt-20 items-center">
          <h1 className="row-span-2 text-2xl text-center font-medium">
            {config.appName}
          </h1>
          {config.notice.visible ? (
            <div className="justify-self-center border-l-4 border-teal-900 dark:border-teal-600 text-white dark:text-rtca-50 p-3 transition-all rounded-md bg-teal-700 dark:bg-teal-900 flex">
              <h1 className="font-medium">{config.notice.title}</h1>&nbsp;{config.notice.message}
            </div>
          ) : (
            <></>
          )}
          <div className="row-span-1 flex flex-row flex-wrap gap-10 items-center justify-center">
            <Login
              sendInfoMessage={sendInfoMessage}
              setLoggedIn={setLoggedIn}
            />
            <div className="hidden sm:flex">or</div>
            <Register sendInfoMessage={sendInfoMessage} />
          </div>
          <div ref={infoBoxRef} className="hidden">
            {errorMsg}
          </div>
        </div>
      );
    }
  };

  return <div>{renderContent()}</div>;
}

export default App;
