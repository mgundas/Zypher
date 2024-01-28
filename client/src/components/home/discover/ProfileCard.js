import React from 'react'
import { getInitials } from "../../../helpers/getInitials"
import { generateRandomColor, generateAltRandomColor } from "../../../helpers/generateRandomColor";
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

export const ProfileCard = ({ user }) => {
   const navigate = useNavigate()
   const { translation } = useSelector(state => state.translation)

   const convertTime = (time) => {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Months are zero-based, so add 1
      const day = date.getDate();

      return `${year}/${month < 10 ? "0" + month : month}/${day < 10 ? "0" + day : day}`;
   };

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
         <dialog id={"modal-" + user.username} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box p-0 grid select-none">
               <div style={{ backgroundColor: generateAltRandomColor(user.username) }} className="font-bold shadow-lg text-lg p-3 h-24">
                  <div style={{
                     backgroundColor: generateRandomColor(user.username)
                  }} className="bg-indigo-700 h-24 w-24 rounded-xl flex items-center justify-center">
                     <p className='text-4xl text-white font-medium'>{getInitials(user.username)}</p>
                  </div>
               </div>
               <div className='p-5 grid grid-cols-1'>
                  <div className='flex justify-between items-center'>
                     <div className='flex flex-col'>
                        <p className='font-bold'>@{user.username}</p>
                        <p><span className='font-bold'>{translation.content.discover.profileModal.joinedOn}</span> {convertTime(user.createdAt)}</p>
                     </div>
                     <button onClick={() => {
                        window.history.pushState(null, '', '/discover');
                        navigate(`/chat/${user.username}`)
                     }} className='btn btn-primary'>{translation.content.discover.profileModal.message}</button>
                  </div>
               </div>
            </div>
            <form method="dialog" className="modal-backdrop">
               <button>close</button>
            </form>
         </dialog>
      </div>
   )
}
