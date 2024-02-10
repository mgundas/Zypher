// TODOS: 
// Implement recipient info fetch upon component mount (done).
// Implement socket events.
// Implement message fetch (done), load more messages when user scrolls up.
// Implement seen feature
// Implement online checker

// Known issues:
// username parameter is sometimes undefined for some reason even though the address includes the username parameter
// Duplicate messages (index 19-20) occur when a new message is added via the socket event.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useSocket } from "../contexts/SocketContext"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { setChatId, setMessages, addMessageEnd, addMessageStart } from "../redux/reducers/chatSlicer"
// import { useSelector } from 'react-redux';
import { convertTime } from "../helpers/timeConverter"

import { setRecipientData } from "../redux/reducers/chatSlicer"
import { ChatBubble } from '../components/chat/ChatBubble';
import { DebugInfo } from '../components/chat/DebugInfo';
import { ProfileModal } from '../components/home/discover/ProfileModal';

export const Chat = () => {
   const { username } = useParams();
   const dispatch = useDispatch();
   const { socket } = useSocket();
   // const navigate = useNavigate();

   const { accessToken } = useSelector(state => state.auth)
   const { messages, chatId, totalMessagesCount, loadedMessagesCount, recipientData } = useSelector(state => state.chat)
   const { userData } = useSelector(state => state.user)
   const { apiUri } = useSelector(state => state.globals)

   const [disabled, setDisabled] = useState(false)
   const [loading, isLoading] = useState(true)
   const [error, setError] = useState(false)
   const [textInput, setTextInput] = useState("")
   const [autoScroll, setAutoScroll] = useState(true)


   const chatBottom = useRef(null)
   const chatContainer = useRef(null)
   const scrollButton = useRef(null)

   useEffect(() => {
      if (socket) {
         socket.on(`message_${chatId}`, (message) => {
            dispatch(addMessageEnd(message))
         })
      }

      return () => {
         if (socket) {
            socket.off(`message_${chatId}`)
         }
      }
   }, [dispatch, chatId, socket])

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
            dispatch(setMessages(fetchedMessages))
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
      // Prevent the default form submission action
      e.preventDefault();

      if (textInput === "" || textInput.trim() === "") {
         return;
      }
      socket.emit("sendMessage", {
         content: textInput,
         sender: userData.id,
         room: chatId
      })
      setTextInput("")
   }

   const handleLoadMore = async () => {
      // Only load more messages if the loaded message count is less than the total message count.
      if (loadedMessagesCount < totalMessagesCount) {
         const size = 20
         const skip = Math.floor(loadedMessagesCount / size);
         const fetchedMessages = await fetchMessages(chatId, size, skip)
         dispatch(addMessageStart(fetchedMessages))
      }
   }

   useEffect(() => {
      // If the chatBottom.current is defined
      if (chatBottom.current) {
         // If auto scroll is enabled
         if (autoScroll) {
            // Scroll to the bottom whenever the loaded message count changes and the requirements are met
            chatBottom.current.scrollIntoView({
               behavior: "smooth",
               block: "end"
            })
         }
      }
   }, [loadedMessagesCount, autoScroll])


   const handleChatScroll = useCallback(() => {
      // Get the current scroll position
      const scrollPosition = chatContainer.current.scrollTop;
      // Get the total height of the chat container
      const totalHeight = chatContainer.current.scrollHeight - chatContainer.current.clientHeight;

      // If the user is close to the bottom, then turn on auto scroll and hide the scroll to bottom button
      if (scrollPosition && scrollPosition > totalHeight - 1000) {
         scrollButton.current.classList.add("hidden")
         setAutoScroll(true)
      // If the user is far from the bottom, turn off the auto scroll and show the scroll to bottom button
      } else {
         scrollButton.current.classList.remove("hidden")
         setAutoScroll(false)
      }
   }, [])

   return (
      <>
         <DebugInfo hidden={true} />
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

            {loadedMessagesCount < totalMessagesCount ? (<button onClick={handleLoadMore} className='btn btn-block btn-sm btn-ghost'>Load more...</button>) : (<></>)}
            
            {loading ? (
               <div className="flex items-center justify-center my-2">
                  <span className=' loading loading-spinner text-info'></span>
               </div>
            ) : (<></>)}
            {
               messages.map((message, key) => {
                  return (
                     <ChatBubble message={message} key={key} />
                  )
               })
            }

            <div ref={chatBottom} className="opacity-0 content-none"></div>
            <button ref={scrollButton} onClick={() => { chatBottom.current.scrollIntoView({ behavior: "smooth" }) }} className="fixed bottom-16 py-1 px-2 bg-base-300 hover:bg-base-200 transition-all rounded-full hidden"><i className="bi bi-chevron-double-down"></i></button>
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
         <ProfileModal user={recipientData} />
      </>
   )
}
