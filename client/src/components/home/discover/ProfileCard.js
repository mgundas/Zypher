import React from 'react'
import { getInitials } from "../../../helpers/getInitials"
import { generateRandomColor, generateAltRandomColor } from "../../../helpers/generateRandomColor";
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { ProfileModal } from './ProfileModal';

export const ProfileCard = ({ user }) => {


   return (
      <div>
         <button onClick={() => document.getElementById("modal-" + user.username).showModal()} className='flex select-none h-24 w-24 rounded-xl relative shadow-lg'>
            <div style={{
               backgroundColor: generateRandomColor(user.username)
            }} className="bg-indigo-700 h-24 w-24 rounded-xl flex items-center justify-center">
               <p className='text-4xl text-white font-medium'>{getInitials(user.username)}</p>
            </div>
            {/* <img src='https://picsum.photos/300/300' className='h-24 w-24 rounded-xl' alt="" /> */}
            <div className='absolute bottom-0 text-xs overflow-clip w-24 px-2 text-white bg-rtca-950/50 rounded-b-xl text-center'>@{user.username}</div>
            <div className='absolute h-3 w-3 -right-1 -top-1 bg-green-500 rounded-full'></div>
         </button>
         <ProfileModal user={user} />
      </div>
   )
}
