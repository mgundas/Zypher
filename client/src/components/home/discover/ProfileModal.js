import React from 'react'
import { generateRandomColor, generateAltRandomColor } from "../../../helpers/generateRandomColor";
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getInitials } from "../../../helpers/getInitials"

export const ProfileModal = ({user}) => {
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
                     navigate(`/profile/${user.username}`)
                  }} className='btn btn-primary'>{translation.content.discover.profileModal.profile}</button>
               </div>
            </div>
         </div>
         <form method="dialog" className="modal-backdrop">
            <button>close</button>
         </form>
      </dialog>)
}
