import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useConfig } from "./contexts/ConfigContext";
import { useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { ChatWindow } from "./components/ChatWindow";
import { MainWindow } from "./components/MainWindow";
import { LoginScreen } from "./components/LoginScreen";

function App() {
  const { socket } = useSocket();
  const config = useConfig();
  const { loggedIn, userData } = useAuth();

  const notificationTimeoutRef = useRef(null);
  const checkInterval = useRef(null);

  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [status, setStatus] = useState(isOnline ? "Online" : "Offline");

  useEffect(() => {
    setStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

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

  const renderContent = () => {
    if (loggedIn && socket) {
      return (
        <div className="chat-screen">
          <Navbar
            setActiveChat={setActiveChat}
            messages={messages}
            handleActiveChat={handleActiveChat}
            activeChat={activeChat}
            status={status}
          />
          {activeChat ? (
            <ChatWindow messages={messages} activeChat={activeChat} />
          ) : (
            <MainWindow setActiveChat={setActiveChat} />
          )}
        </div>
      );
    } else {
      return <LoginScreen />;
    }
  };

  return <>{renderContent()}</>;
}

export default App;
