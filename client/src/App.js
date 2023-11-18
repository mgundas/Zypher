import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import ToggleDarkMode from "./modules/ToggleDarkMode";
import Message from "./modules/Message";
import ChatInput from "./modules/ChatInput";
import Login from "./modules/Login";
import Register from "./modules/Register";
import { useConfig } from "./contexts/ConfigContext";
import { useAuth } from "./contexts/AuthContext";
import { generateRandomColor } from "./helpers/generateRandomColor";
import { SenderList } from "./modules/SenderList";
import { getInitials } from "./helpers/getInitials";

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
            <div className="navbar bg-base-100">
              <div className="navbar-start">
                <div className="flex items-center">
                  <SenderList
                    setActiveChat={setActiveChat}
                    uniqueSenders={uniqueSenders}
                    handleActiveChat={handleActiveChat}
                  />
                  {activeChat ? (
                    <div className="p-4 px-2 flex gap-3 items-center">
                      <div
                        style={{
                          backgroundColor: generateRandomColor(activeChat),
                        }}
                        className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10 "
                      >
                        {getInitials(activeChat)}
                      </div>
                      <div className="flex flex-col text-sm items-start">
                        <button className="font-medium">{activeChat}</button>
                        <span className="text-rtca-400 select-none">
                          {status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="navbar-center hidden sm:block">
                <button className="btn btn-ghost text-xl">
                  {config.appName}
                </button>
              </div>
              <div className="navbar-end gap-2">
                <ToggleDarkMode />
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-circle">
                    <div className="indicator">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                  </button>
                  <div
                    tabIndex={0}
                    className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-rtca-800 rounded-t-none"
                  >
                    <div className="p-1 grid gap-1">
                      <h3 className="text-center text-lg font-medium">
                        Notifications
                      </h3>
                      <div className="overflow-y-auto max-h-[calc(100vh/2)]">
                        <div className="p-1 relative flex gap-2 text-sm">
                          <div className="absolute right-3 select-none">
                            10w
                          </div>
                          <div
                            style={{
                              backgroundColor: generateRandomColor(
                                userData.username
                              ),
                            }}
                            className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 "
                          >
                            {getInitials(userData.username)}
                          </div>
                          <div className="grid">
                            <p>New follower!</p>
                            <p>@mitchgrassi started to follow you.</p>
                          </div>
                        </div>
                        <div className="p-1 flex gap-2 text-sm">
                          <div
                            style={{
                              backgroundColor: generateRandomColor(
                                userData.username
                              ),
                            }}
                            className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 "
                          >
                            {getInitials(userData.username)}
                          </div>
                          <div className="grid">
                            <p>New follower!</p>
                            <p>@mitchgrassi started to follow you.</p>
                          </div>
                        </div>
                        <div className="p-1 flex gap-2 text-sm">
                          <div
                            style={{
                              backgroundColor: generateRandomColor(
                                userData.username
                              ),
                            }}
                            className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 "
                          >
                            {getInitials(userData.username)}
                          </div>
                          <div className="grid">
                            <p>New follower!</p>
                            <p>@mitchgrassi started to follow you.</p>
                          </div>
                        </div>
                        <div className="p-1 flex gap-2 text-sm">
                          <div
                            style={{
                              backgroundColor: generateRandomColor(
                                userData.username
                              ),
                            }}
                            className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 "
                          >
                            {getInitials(userData.username)}
                          </div>
                          <div className="grid">
                            <p>New follower!</p>
                            <p>@mitchgrassi started to follow you.</p>
                          </div>
                        </div>
                        <div className="p-1 flex gap-2 text-sm">
                          <div
                            style={{
                              backgroundColor: generateRandomColor(
                                userData.username
                              ),
                            }}
                            className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 "
                          >
                            {getInitials(userData.username)}
                          </div>
                          <div className="grid">
                            <p>New follower!</p>
                            <p>@mitchgrassi started to follow you.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    style={{
                      backgroundColor: generateRandomColor(userData.username),
                    }}
                    className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10 "
                  >
                    {getInitials(userData.username)}
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-rtca-800 rounded-box rounded-t-none w-52"
                  >
                    <li>
                      <button className="justify-between">
                        Profile
                        <span className="badge bg-rtca-700 border-none">
                          New
                        </span>
                      </button>
                    </li>
                    <li>
                      <button>Settings</button>
                    </li>
                    <li>
                      <button>Logout</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
                    if(user.username === userData.username) return;
                    return (
                      <button onClick={() => setActiveChat(user.username)} className="btn btn-accent" key={index}>{user.username}</button>
                    )
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
