// TODOS: 
// Implement recipient info fetch upon component mount.
// Implement socket events.
// Implement message fetch, load more messages when user scrolls up.
// Implement seen feature
// Implement online checker

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useDispatch } from "react-redux"
// import { useSelector } from 'react-redux';

import { setRecipientData } from "../redux/reducers/chatSlicer"

export const Chat = () => {
   const { username } = useParams();
   const dispatch = useDispatch();
   // const navigate = useNavigate();

   useEffect(() => {
      dispatch(setRecipientData({
         username: username
      }))
   }, [dispatch, username])


   return (
      <>
         <div
            className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden p-2 dark:text-white 
relative"
         >
            <div class="grid w-full gap-4 items-center p-2 px-3">
               <div className="chat self-end chat-end">
                  <div className="skeleton chat-bubble w-1/3 bg-rtca-900">
                  </div>
               </div>
               <div className="chat self-start chat-start">
                  <div className="skeleton chat-bubble w-1/3 bg-rtca-900">
                  </div>
               </div>
            </div>
            {/* <div className="flex p-1 rounded-lg text-center px-2 items-center bg-teal-700 text-sm font-medium select-none">
        Please do not share your password or personal information.
      </div> */}
            {/* <div className="time-divider">Today</div> */}
            <div className="opacity-0 content-none"></div>
            <button className="fixed bottom-16 py-1 px-2 bg-rtca-800 hover:bg-rtca-900 transition-all rounded-full hidden"><i className="bi bi-chevron-double-down"></i></button>
         </div>
         <form className="p-2 bottom-0 md:relative flex gap-2 w-screen" >
            <input
               className="chat-input"
               type="text"
               placeholder="Type a message..."
            />
            <button
               type="submit"
               className="btn btn-md h-10 min-h-min btn-primary btn-circle"
            >
               <i className="bi bi-send text-xl"></i>
            </button>
         </form>
      </>
   )
}
