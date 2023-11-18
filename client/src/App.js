import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import Message from "./components/Message";
import ChatInput from "./components/ChatInput";
import Login from "./components/Login";
import Register from "./components/Register";
import { useConfig } from "./contexts/ConfigContext";
import { useAuth } from "./contexts/AuthContext";
import { generateRandomColor } from "./helpers/generateRandomColor";
import { getInitials } from "./helpers/getInitials";
import { Navbar } from "./components/Navbar";

function App() {
  const { socket } = useSocket();
  const config = useConfig();
  const { loggedIn, userData } = useAuth();

  const infoBoxRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const infoTimeoutRef = useRef(null);
  const bottomRef = useRef(null);
  const chatWindow = useRef(null);
  const seenRef = useRef(null);
  const checkInterval = useRef(null);

  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [status, setStatus] = useState(isOnline ? "Online" : "Offline");
  const [uniqueSenders, setUniqueSenders] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  //const [lastMessage, setLastMessage] = useState({});

  useEffect(() => {
    setStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  /* const getLastMessage = (user) => {
    const lastMessageArray = messages
    .filter(message => {
      if(message.sender === userData.username && message.recipient === user || message.sender === user && message.recipient === userData.user){
        return message;
      }
    })
    .reduce((acc, current) => (current.timestamp > acc.timestamp ? current : acc), {});
    console.log(lastMessageArray);
    setLastMessage(lastMessageArray);
  } */

  useEffect(() => {
    const senders = [
      ...new Set(
        messages.map((message) => {
          if (message.sender !== userData.username) {
            return message.sender;
          } else {
            return message.recipient;
          }
        })
      ),
    ];
    setUniqueSenders(senders);

    const filtered = messages.filter((message) => {
      if (
        message.sender === activeChat &&
        message.recipient === userData.username
      ) {
        return message.sender === activeChat;
      } else if (
        message.sender === userData.username &&
        message.recipient === activeChat
      ) {
        return message.recipient === activeChat;
      } else {
        return null;
      }
    });
    seenRef.current?.classList.add("hidden");
    setFilteredMessages(filtered);
  }, [messages, activeChat, userData.username]);

  useEffect(() => {
    document.title = config.appName;
  }, [config.appName]);

  const handleActiveChat = (sender) => {
    document.title = sender + " | " + config.appName;
    setActiveChat(sender);
  };

  useEffect(() => {
    if (activeChat) {
      socket.emit("isOnline", { username: activeChat }, (response) => {
        console.log(response);
        setIsOnline(response);
      });
      clearInterval(checkInterval.current);
      checkInterval.current = setInterval(() => {
        socket.emit("isOnline", { username: activeChat }, (response) => {
          console.log(response);
          setIsOnline(response);
        });
      }, 100 * 60);
    }

    return () => {
      clearInterval(checkInterval.current);
    };
  }, [activeChat, socket]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        if (data.sender !== userData.username) {
          document.title = "New message!";
        }
        seenRef.current?.classList.add("hidden");
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
          if (activeChat) {
            document.title = activeChat + " | " + config.appName;
          } else {
            document.title = config.appName;
          }
        }, 2000);
      };

      const handleUserTyping = (data) => {
        if (activeChat) {
          if (activeChat === data.sender) {
            setStatus("Typing...");
          }
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (activeChat) {
          if (activeChat === data.sender) {
            setStatus(isOnline ? "Online" : "Offline");
          }
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
  }, [
    socket,
    messages,
    userData.username,
    config.appName,
    activeChat,
    isOnline,
  ]);

  const sendInfoMessage = (message, type) => {
    const types = {
      success: "alert-success",
      failure: "alert-error",
      warning: "alert-warning",
      info: "alert-info",
    };

    infoBoxRef.current.className = `alert !w-auto justify-self-center ${types[type]}`;
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
          <div className="chat-screen">
            <Navbar setActiveChat={setActiveChat} uniqueSenders={uniqueSenders} handleActiveChat={handleActiveChat} activeChat={activeChat} status={status} />
            {activeChat ? (
              <>
                <div
                  ref={chatWindow}
                  className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white relative"
                >
                  <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
                    Please do not share your password or personal information.
                  </div>
                  {/* <div className="time-divider">Today</div> */}
                  {filteredMessages.map((message, index, array) => (
                    <Message
                      key={index}
                      id={message.id}
                      message={message}
                      isLastMessage={index === array.length - 1}
                    />
                  ))}
                  <div ref={bottomRef} className="opacity-0 content-none"></div>
                </div>
                <ChatInput recipient={activeChat} />
              </>
            ) : (
              <div className="flex flex-col flex-1 items-center justify-center">
                <button
                  onClick={() => {
                    socket.emit("randomUsers", 10, (data) => {
                      setRandomUsers(data);
                      console.log(data);
                    });
                  }}
                  className="btn btn-outline btn-accent"
                >
                  Randomize
                </button>
                <div className="p-2 flex gap-2">
                  {randomUsers.map((user, index) => {
                    if (user.username === userData.username) return;
                    return (
                      <button className="relative tooltip tooltip-bottom" data-tip={user.username}>
                        <span className="h-3 w-3 rounded-full bg-green-600 absolute -top-0.5 -right-0.5 z-[1]"></span>
                        <div
                          onClick={() => setActiveChat(user.username)}
                          key={index}
                          style={{
                            backgroundColor: generateRandomColor(user.username),
                          }}
                          className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 text-white relative"
                        >
                          {getInitials(user.username)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      );
    } else {
      return (
        <div className="dark:text-white grid gap-5 mb-10 mt-10 md:mt-20 items-center">
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
          <div ref={infoBoxRef} class="hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
          <div className="row-span-1 flex flex-row flex-wrap gap-10 items-center justify-center">
            <Login sendInfoMessage={sendInfoMessage} />
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
