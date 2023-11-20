import { useRef, useEffect, useState } from "react";
import { useSocket } from "./contexts/SocketContext";
import { useConfig } from "./contexts/ConfigContext";
import { useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { ChatWindow } from "./components/ChatWindow";
import { MainWindow } from "./components/MainWindow";
import { LoginScreen } from "./components/pages/LoginScreen";
import { useRecipient } from "./contexts/RecipientContext";

function App() {
  const { socket } = useSocket();
  const config = useConfig();
  const { loggedIn, userData, authToken } = useAuth();
  const { setRecipient, recipientData, activeChat, setActiveChat } =
    useRecipient();

  const notificationTimeoutRef = useRef(null);
  const checkInterval = useRef(null);
  const chatWindowRef = useRef(null);

  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(isOnline ? "Online" : "Offline");

  const [loadedMessages, setLoadedMessages] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(isOnline ? "Online" : "Offline");
  }, [isOnline]);

  useEffect(() => {
    document.title = config.appName;
  }, [config.appName]);

  const handleActiveChat = (recipient) => {
    setRecipient(recipient);
  };

  useEffect(() => {
    if (activeChat) {
      socket.emit(
        "isOnline",
        { username: recipientData.username },
        (response) => {
          setIsOnline(response);
        }
      );
      clearInterval(checkInterval.current);
      checkInterval.current = setInterval(() => {
        socket.emit(
          "isOnline",
          { username: recipientData.username },
          (response) => {
            setIsOnline(response);
          }
        );
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
        if (data.sender !== userData.id) {
          document.title = "New message!";
        }
        setLoadedMessages((prevLoaded) => prevLoaded + 1);
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
          if (recipientData.length) {
            document.title = recipientData.username + " | " + config.appName;
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

  const fetchMessages = async (limit, skip) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${config.apiUri}/messages?sender=${userData.id}&recipient=${recipientData.id}&limit=${limit}&skip=${skip}`,
        {
          method: "GET",
          headers: {
            Authorization: `${authToken}`,
          },
        }
      );
      const data = await response.json();

      setMessages((prevMessages) => [...data.messages, ...prevMessages]);
      setLoadedMessages((prevLoaded) => prevLoaded + data.messages.length);
      setTotalMessages(data.total); // Assuming the API returns the total number of messages
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = chatWindowRef.current;

    if (
      container.scrollTop === 0 &&
      !loading &&
      loadedMessages < totalMessages
    ) {
      const limit = 10 // Adjust the limit as needed
      const skip = Math.floor(loadedMessages / 10);

      console.log(limit, skip)
      fetchMessages(limit, skip);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(10, 0);
    }
  }, [activeChat]);

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
            <ChatWindow
              messages={messages}
              activeChat={activeChat}
              chatWindowRef={chatWindowRef}
              handleScroll={handleScroll}
              loading={loading}
            />
          ) : (
            <MainWindow handleActiveChat={handleActiveChat} />
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
