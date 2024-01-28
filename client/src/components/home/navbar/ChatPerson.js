import React from 'react'
import { generateRandomColor } from '../../../helpers/generateRandomColor';
import { getInitials } from '../../../helpers/getInitials';
import { useSelector } from "react-redux"

export const ChatPerson = () => {
   const { recipientData } = useSelector((state) => state.chat)
   return (
      <button className="p-4 px-2 flex gap-3 items-center">
         <div className="avatar online z-0 placeholder">
            <div
               style={{
                  backgroundColor: generateRandomColor(recipientData.username),
               }}
               className="bg-neutral text-neutral-content rounded-full w-11">
               <span className="text-xl">{getInitials(recipientData.username)}</span>
            </div>
         </div>

         <div className="flex flex-col text-sm items-start">
            <div className="font-medium">{recipientData.username}</div>
            <span className="text-rtca-400 select-none">Some status</span>
         </div>
      </button >
   )
}
