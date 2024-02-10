import React from 'react'
import { useSelector } from 'react-redux'
import { convertTime } from "../../helpers/timeConverter"

export const ChatBubble = ({message}) => {
   const { userData } = useSelector(state => state.user)
   const { translation } = useSelector(state => state.translation)
   const { recipientData } = useSelector(state => state.chat)

   return (
      <div
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
      </div>)
}
