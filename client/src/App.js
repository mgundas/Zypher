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
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const convoModal = useRef(null);
  const chatWindow = useRef(null);
  const seenRef = useRef(null);
  const checkInterval = useRef(null);

  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [status, setStatus] = useState(isOnline ? "Online" : "Offline");
  const [uniqueSenders, setUniqueSenders] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  //const [lastMessage, setLastMessage] = useState({});
  const [newConvoActive, setNewConvoActive] = useState(false);

  useEffect(() => {
    setStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  useEffect(() => {
    if (newConvoActive === true) {
      convoModal.current?.classList.remove("!hidden");
    } else {
      convoModal.current?.classList.add("!hidden");
    }
  }, [newConvoActive]);

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

  const closeSidebar = () => {
    sidebarRef.current.classList.add("-translate-x-60");
    overlayRef.current.classList.add("hidden");
  };

  const renderContent = () => {
    if (loggedIn && socket) {
      return (
        <>
          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box bg-rtca-800">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">Start a new conversation.</h3>
              <p className="py-2 flex">
                <form
                  className="flex gap-2 p-4 grow items-center justify-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNewConvoActive(false);
                    setActiveChat(searchInput);
                  }}
                >
                  <input
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                    }}
                    className="convo-modal-content-input grow"
                    placeholder="Search for a user."
                    maxLength={12}
                  />
                  <button type="submit" className=" chat-send-button">
                    <i className="bi bi-search"></i>
                  </button>
                </form>
              </p>
            </div>
          </dialog>
          <div className="chat-screen">
            <nav className="navbar">
              <div className="flex items-center">
                <SenderList
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
                  <>
                    <div className="font-medium p-4">{config.appName}</div>
                  </>
                )}
              </div>
              <div className="flex gap-4 items-center">
                <ul className="flex gap-3 font-medium items-center">
                  <ToggleDarkMode />
                  <button className="nav-button">
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </ul>
              </div>
            </nav>
            {activeChat ? (
              <>
                <div
                  ref={chatWindow}
                  className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white relative"
                >
                    <div className="flex p-1 rounded-full px-2 items-center bg-teal-700 text-sm font-medium select-none">Please do not share your password or personal information.</div>
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
              <div className="flex gap-2 items-center flex-1 justify-center dark:text-white font-medium">
                Why don't you click on the <i className="bi bi-list"></i> button
                to select a conversation?
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
          <div ref={infoBoxRef} className="hidden">
            {errorMsg}
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
