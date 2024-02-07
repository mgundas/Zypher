// TODOS: 
// Implement recipient info fetch upon component mount (done).
// Implement socket events.
// Implement message fetch (done), load more messages when user scrolls up.
// Implement seen feature
// Implement online checker

// Known issues:
// username parameter is sometimes undefined for some reason even though the address includes the username parameter

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useSocket } from "../contexts/SocketContext"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setChatId, setMessages } from "../redux/reducers/chatSlicer"
// import { useSelector } from 'react-redux';
import { convertTime } from "../helpers/timeConverter"

import { setRecipientData } from "../redux/reducers/chatSlicer"

export const Chat = () => {
   const { username } = useParams();
   const dispatch = useDispatch();
   const { socket } = useSocket();
   // const navigate = useNavigate();

   const { accessToken } = useSelector(state => state.auth)
   const { messages, recipientData, idChat } = useSelector(state => state.chat)
   const { userData } = useSelector(state => state.user)
   const { apiUri } = useSelector(state => state.globals)

   const [disabled, setDisabled] = useState(false)
   const [error, setError] = useState(false)

   const [textInput, setTextInput] = useState("")

   useEffect(() => {
      if (socket) {
         socket.on("message", (message) => {
            console.log(message)
         })
      }
   }, [socket])

   const fetchMessages = useCallback(async (room, size, skip) => {
      try {
         const response = await axios.get(`${apiUri}/messages`,
            {
               headers: {
                  Authorization: accessToken,
               },
               params: {
                  room: room,
                  size: size,
                  skip: skip
               }
            })
         dispatch(setMessages(response.data.messages))
      } catch (err) {
         console.log(err.message);
      }

   }, [accessToken, apiUri, dispatch])

   const fetchUserData = useCallback(async () => {
      try {
         const response = await axios.get(`${apiUri}/chat`, {
            headers: {
               Authorization: accessToken,
            },
            params: {
               username: username
            }
         });

         if (response.data.success) {
            dispatch(setRecipientData(response.data.user))
            dispatch(setChatId(response.data.id))

            fetchMessages(response.data.id, 10, 0)
         } else {
            dispatch(setRecipientData({
               username: ""
            }))
            setDisabled(true)
         }

      } catch (err) {
         if (err.message.includes("404")) {
            dispatch(setRecipientData({
               username: ""
            }))
            setDisabled(true)
            setError(false)
         } else {
            if (process.env.NODE_ENV === "development") console.error(`Something went wrong in the Chat page: ${err.message}`);
            setDisabled(true)
            setError(true)
         }
      }
   }, [apiUri, accessToken, username, dispatch, fetchMessages])

   useEffect(() => {
      fetchUserData();
   }, [fetchUserData])

   const handleSendMessage = (e) => { 
      e.preventDefault();
      if (textInput === "" || textInput.trim() === "") {
         return;
      }
      socket.emit("sendMessage", {
         content: textInput,
         sender: userData.id,
         room: idChat
      })
      setTextInput("")
   }


   return (
      <>
         <div
            className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
         >
            {disabled ? (
               <div className="flex p-1 rounded-lg text-center px-2 items-center bg-error text-sm font-medium select-none">
                  {error ? ("An error occured.") : ("User does not exist, yet.")}
               </div>
            ) : (<></>)}
            {messages.map((message, key) => {
               return (
                  <div
                     key={key}
                     className={
                        message.sender === userData.id ? "chat self-end chat-end" : "chat self-start chat-start "
                     }
                  >
                     <div className="chat-header items-center pb-1">
                        {message.sender === userData.id ? userData.username : recipientData.username}
                        <time className="text-xs opacity-50 mx-1">{convertTime(message.timestamp)}</time>
                     </div>
                     <div className="chat-bubble max-w-full bg-base-300 text-base-content break-words">
                        {message.content}
                     </div>
                     <div className="chat-footer opacity-50 hidden">Seen</div>
                  </div>
               )
            })}
            {/* 
               <div className="grid w-full gap-4 items-center p-2 px-3">
                  <div className="chat self-end chat-end">
                     <div className="skeleton chat-bubble w-1/3 bg-rtca-900">
                     </div>
                  </div>
                  <div className="chat self-start chat-start">
                     <div className="skeleton chat-bubble w-1/3 bg-rtca-900">
                     </div>
                  </div>
               </div>
               <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
                  Please do not share your password or personal information.
               </div> 
               <div className="time-divider">Today</div> */}
            <div className="opacity-0 content-none"></div>
            <button className="fixed bottom-16 py-1 px-2 bg-rtca-800 hover:bg-rtca-900 transition-all rounded-full hidden"><i className="bi bi-chevron-double-down"></i></button>
         </div>
         <form className="p-2 bottom-0 md:relative flex gap-2 w-screen" onSubmit={handleSendMessage} >
            <input
               onChange={e => setTextInput(e.target.value)}
               value={textInput}
               disabled={disabled ? true : false}
               className="chat-input"
               type="text"
               placeholder="Type a message..."
            />
            <button
               disabled={disabled ? true : false}
               type="submit"
               className="btn btn-md h-10 w-10 min-h-min btn-primary"
            >
               <i className="bi bi-send text-xl"></i>
            </button>
         </form>
      </>
   )
}
