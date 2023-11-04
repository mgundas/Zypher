import { useRef, useEffect, useState } from "react";
import ToggleDarkMode from "./modules/ToggleDarkMode";
import Message from "./modules/Message";
import ChatInput from "./modules/ChatInput";
import { useSocket } from "./contexts/SocketContext";
import Login from "./modules/Login";
import Register from "./modules/Register";

function App() {
  const { socket, setAuth } = useSocket();
  const [loggedIn, setLoggedIn] = useState(false);
  const unameRef = useRef(null);
  const infoBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const chatContainerRef = useRef(null);
  const titleTimeoutRef = useRef(null);

  useEffect(() => {
    document.title = "Chat App";
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("receiveId", (data) => {
        unameRef.current.innerHTML = data.username;
        console.log(data);
      });

      socket.on("receiveMessage", (data) => {
        console.log("triggered", data);
        setMessages((prev) => [...prev, data]);
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
        console.log(messages);
        if (data.sender !== socket.auth.username) {
          document.title = "New message!";
        }
        clearTimeout(titleTimeoutRef.current);
        titleTimeoutRef.current = setTimeout(() => {
          document.title = "Chat App";
        }, 2000); // Adjust the timeout duration as needed
      });
    }
    return () => {
      if (socket) {
        socket.off("receiveId");
        socket.off("receiveMessage");
      }
    };
  }, [socket, messages]);

  const sendErrorMessage = (message, type) => {
    switch (type) {
      case "success":
        infoBoxRef.current.classList.add("bg-green-900")
        infoBoxRef.current.classList.remove("bg-red-900")
        infoBoxRef.current.classList.remove("bg-orange-800")
        infoBoxRef.current.classList.remove("bg-gray-700")
        break;
      case "failure":
        infoBoxRef.current.classList.remove("bg-green-900")
        infoBoxRef.current.classList.add("bg-red-900")
        infoBoxRef.current.classList.remove("bg-orange-800")
        infoBoxRef.current.classList.remove("bg-gray-700")
        break;
      case "warning":
        infoBoxRef.current.classList.remove("bg-green-900")
        infoBoxRef.current.classList.remove("bg-red-900")
        infoBoxRef.current.classList.add("bg-orange-800")
        infoBoxRef.current.classList.remove("bg-gray-700")
        break;
      default:
        infoBoxRef.current.classList.remove("bg-green-900")
        infoBoxRef.current.classList.remove("bg-red-900")
        infoBoxRef.current.classList.remove("bg-orange-800")
        infoBoxRef.current.classList.add("bg-gray-700")
        break;
    }
    setErrorMsg(message);
    infoBoxRef.current.classList.remove("hidden");

    // Clear the previous timeout and set a new one
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
    infoBoxRef.current.classList.add("hidden");
    }, 2000); // Adjust the timeout duration as needed
  };

  return (
    <div>
      {loggedIn && socket ? (
        <div className="">
          <nav className=" bg-rtca-300 dark:bg-rtca-900 dark:text-rtca-300 flex p-2 px-5 justify-between items-center h-16">
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
              {messages.map((message, key) => {
                return (
                  <Message
                    key={key}
                    username={message.sender}
                    message={message.message}
                    timestamp="31.10.2023 6:27PM"
                  />
                );
              })}
            </div>
            <ChatInput />
          </div>
        </div>
      ) : (
        /* if the user isn't logged in */
        <div className="z-10 dark:text-white grid gap-10 mb-10 mt-20 items-center">
          <h1 className="row-span-2 text-2xl text-center font-medium">
            Chat App
          </h1>
          <div className="row-span-1 flex flex-row flex-wrap gap-10 items-center justify-center">
            <Login sendErrorMessage={sendErrorMessage} setLoggedIn={setLoggedIn} />
            <Register sendErrorMessage={sendErrorMessage} />
          </div>
          <div
            ref={infoBoxRef}
            className="justify-self-center text-rtca-50 p-3 rounded-md transition-all hidden"
          >
            {errorMsg}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
