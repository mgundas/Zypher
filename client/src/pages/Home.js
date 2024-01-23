import { useRef, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSocket } from "../contexts/SocketContext";
import { useConfig } from "../contexts/ConfigContext";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/Navbar";
import { ChatWindow } from "../components/ChatWindow";
import { MainWindow } from "../components/MainWindow";
import { useRecipient } from "../contexts/RecipientContext";
import { useSelector } from 'react-redux';

export default function Home() {
   const navigate = useNavigate()
   const { socket } = useSocket();
   const config = useConfig();
   const { loggedIn, userData, authLoading } = useAuth();
   const { recipientData, activeChat } = useRecipient();
   const isLoggedIn = useSelector((state) => state.loggedIn.loggedIn);

   const notificationTimeoutRef = useRef(null);
   const checkInterval = useRef(null);

   const [isOnline, setIsOnline] = useState(false);
   const [messages, setMessages] = useState([]);
   const [status, setStatus] = useState(isOnline ? "Online" : "Offline");
   const [loadedMessages, setLoadedMessages] = useState(0);

   const [loading, setLoading] = useState(false);
   const timeoutRef = useRef(null)

   useEffect(() => {
      if (!authLoading) {
         if (!isLoggedIn) {
            console.log("not logged in for some reason", isLoggedIn);
            navigate("/login", { replace: true })
         }
      }

      return () => {
      }
   }, [isLoggedIn, authLoading, navigate])


   useEffect(() => {
      setStatus(isOnline ? "Online" : "Offline");
   }, [isOnline]);

   useEffect(() => {
      document.title = config.appName;
   }, [config.appName]);

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
   }, [activeChat, socket, recipientData.username]);

   useEffect(() => {
      if (socket) {
         const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => [...new Set([...new Set(prevMessages), data])]);
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
      recipientData.username,
      recipientData.length,
      userData.id,
      config.appName,
      activeChat,
      isOnline,
   ]);

   if (isLoggedIn && socket) {
      return (
         <div className="chat-screen">
            {/* <Navbar
               messages={messages}
               status={status}
            /> */}
            <Routes>
               <Route exact path="/" element={<MainWindow />} />
               <Route path="/chat" element={
                  <ChatWindow
                     messages={messages}
                     activeChat={activeChat}
                     loading={loading}
                     loadedMessages={loadedMessages}
                     setLoadedMessages={setLoadedMessages}
                     setLoading={setLoading}
                     setMessages={setMessages}
                  />} />
            </Routes>
         </div>
      )
   } else {

   }
}
