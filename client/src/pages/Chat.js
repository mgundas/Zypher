// TODOS: 
// Implement recipient info fetch upon component mount.
// Implement socket events.
// Implement message fetch, load more messages when user scrolls up.
// Implement seen feature
// Implement online checker

// Known issues:
// username parameter is sometimes undefined for some reason even though the address includes the username parameter

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux"
import { useConfig } from "../contexts/ConfigContext"
import axios from "axios"
import { setIdChat } from "../redux/reducers/chatSlicer"
// import { useSelector } from 'react-redux';

import { setRecipientData } from "../redux/reducers/chatSlicer"

export const Chat = () => {
   const config = useConfig()
   const { accessToken } = useSelector(state => state.auth)
   const { idChat } = useSelector(state => state.chat)
   const { username } = useParams();
   const dispatch = useDispatch();
   // const navigate = useNavigate();

   const [disabled, setDisabled] = useState(false)
   const [error, setError] = useState(false)

   const fetchMessages = useCallback(async (room, size, skip) => {
      try {
         const messages = await axios.get(`${config.apiUri}/messages`,
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
      } catch (err) {
         
      }

   }, [])

   const fetchUserData = useCallback(async () => {
      try {
         const response = await axios.get(`${config.apiUri}/chat`, {
            headers: {
               Authorization: accessToken,
            },
            params: {
               username: username
            }
         });

         if (response.data.success) {
            dispatch(setRecipientData({
               username: response.data.user.username
            }))
            dispatch(setIdChat(response.data.id))

            fetchMessages(response.data.id, 30, 0)
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
   }, [accessToken, config.apiUri, username, dispatch])

   useEffect(() => {
      fetchUserData();
   }, [fetchUserData])


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
         <form className="p-2 bottom-0 md:relative flex gap-2 w-screen" >
            <input
               disabled={disabled ? true : false}
               className="chat-input"
               type="text"
               placeholder="Type a message..."
            />
            <button
               disabled={disabled ? true : false}
               type="submit"
               className="btn btn-md h-10 min-h-min btn-primary btn-circle"
            >
               <i className="bi bi-send text-xl"></i>
            </button>
         </form>
      </>
   )
}
