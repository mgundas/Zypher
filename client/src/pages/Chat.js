// TODOS: 
// Implement recipient info fetch upon component mount (done).
// Implement socket events.
// Implement message fetch (done), load more messages when user scrolls up.
// Implement seen feature
// Implement online checker

// Known issues:
// username parameter is sometimes undefined for some reason even though the address includes the username parameter

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useSocket } from "../contexts/SocketContext"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setChatId, setMessages, addMessageEnd, addMessageStart, addLoadedMessagesCount, setTotalMessagesCount, addTotalMessagesCount } from "../redux/reducers/chatSlicer"
// import { useSelector } from 'react-redux';
import { convertTime } from "../helpers/timeConverter"

import { setRecipientData } from "../redux/reducers/chatSlicer"

export const Chat = () => {
   const { username } = useParams();
   const dispatch = useDispatch();
   const { socket } = useSocket();
   // const navigate = useNavigate();

   const { accessToken } = useSelector(state => state.auth)
   const { messages, recipientData, idChat, totalMessagesCount, loadedMessagesCount } = useSelector(state => state.chat)
   const { userData } = useSelector(state => state.user)
   const { apiUri } = useSelector(state => state.globals)

   const [disabled, setDisabled] = useState(false)
   const [loading, isLoading] = useState(true)
   const [error, setError] = useState(false)
   const [textInput, setTextInput] = useState("")

   const chatBottom = useRef(null)
   const chatContainer = useRef(null)

   useEffect(() => {
      if (socket) {
         socket.on("message", (message) => {
            dispatch(addMessageEnd(message))
            dispatch(addTotalMessagesCount(1))
            dispatch(addLoadedMessagesCount(1))
         })
      }

      return () => {
         if (socket) {
            socket.off("message")
         }
      }
   }, [dispatch, socket])

   const fetchMessages = useCallback(async (room, size, skip) => {
      try {
         isLoading(true)
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
            }
         )
         return response.data
      } catch (err) {
         console.log(err.message);
      } finally {
         isLoading(false)
      }

   }, [accessToken, apiUri])

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

            const fetchedMessages = await fetchMessages(response.data.id, 20, 0)
            dispatch(setTotalMessagesCount(fetchedMessages.total))
            dispatch(addLoadedMessagesCount(fetchedMessages.messages.length))
            dispatch(setMessages(fetchedMessages.messages))
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

   const handleLoadMore = async () => {
      if (loadedMessagesCount < totalMessagesCount) {
         const size = 20
         const skip = Math.floor(loadedMessagesCount / size)
         const fetchedMessages = await fetchMessages(idChat, size, skip)
         console.log(fetchedMessages);
         dispatch(addMessageStart(fetchedMessages.messages))
         dispatch(setTotalMessagesCount(fetchedMessages.total))
         dispatch(addLoadedMessagesCount(fetchedMessages.messages.length))
      }
   }

   const handleChatScroll = (e) => {
      /* //chatContainer.current.scrollTop = chatContainer.current.scrollHeight - chatContainer.current.clientHeight
      // Get the current scroll position
      const scrollPosition = chatContainer.current.scrollTop;

      // Calculate the percentage of scroll position
      const totalHeight = chatContainer.current.scrollHeight - chatContainer.current.clientHeight;
      const scrollPercentage = Math.floor((scrollPosition / totalHeight) * 100);

      console.log('Scroll position percentage:', scrollPercentage);*/
   }

   return (
      <>
         <div className='fixed top-20 left-20 z-50 p-2 bg-accent/80 text-black rounded-lg'>
            <p>Loaded messages: {loadedMessagesCount}</p>
            <p>Total messages: {totalMessagesCount}</p>
         </div>
         <div
            ref={chatContainer}
            onScroll={handleChatScroll}
            className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
         >
            {disabled ? (
               <div className="flex p-1 rounded-lg text-center px-2 items-center bg-error text-sm font-medium select-none">
                  {error ? ("An error occured.") : ("User does not exist, yet.")}
               </div>
            ) : (<></>)}
            <button onClick={handleLoadMore} className='btn btn-block rounded-none btn-ghost'>Load more...</button>
            {loading ? (
               <div className="grid w-full gap-4 items-center p-2 px-3">
                  <div className="chat self-end chat-end">
                     <div className="skeleton chat-bubble w-1/3 bg-base-300">
                     </div>
                  </div>
                  <div className="chat self-start chat-start">
                     <div className="skeleton chat-bubble w-1/3 bg-base-300">
                     </div>
                  </div>
               </div>
            ) : (<></>)}
            {
               messages.map((message, key) => {
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
               
               <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
                  Please do not share your password or personal information.
               </div> 
               <div className="time-divider">Today</div> */}
            <div ref={chatBottom} className="opacity-0 content-none"></div>
            <button onClick={() => {chatBottom.current.scrollIntoView({behavior: "smooth"})}} className="fixed bottom-16 py-1 px-2 bg-base-300 hover:bg-base-200 transition-all rounded-full"><i className="bi bi-chevron-double-down"></i></button>
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
