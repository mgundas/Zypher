import React from 'react'
import { useParams } from 'react-router-dom'

export const Profile = () => {
   const { username } = useParams()
   return (
      <div className='flex flex-col flex-1 overflow-auto'>
         <div className='h-40 w-full relative'>
            <img className='bg-green-800 h-40 w-full object-cover drop-shadow-2xl content' src='https://placehold.co/1920x1080' alt='cover' />
            <div className="absolute sm:-bottom-[40%] left-4 -bottom-[36%] avatar h-32 w-32 overflow-hidden rounded-full ring-2 ring-base-100">
               <img src="https://placehold.co/500x500" alt="Profile" />
            </div>
         </div>
         <div className='grid grid-cols-1 p-4 gap-2'>
            <div className='flex h-12 items-center justify-end gap-2'>
               <button className='btn btn-accent'><i className="bi bi-chat-fill"></i></button>
               <button className='btn'><i className="bi bi-pencil-square"></i></button>
            </div>
            <div className=' flex flex-col'>
               <h1 className='text-lg font-bold'>Mehmet Gündaş</h1>
               <h1 className='text-sm text-gray-500'>@{username}</h1>
            </div>
            <p className='flex gap-2 text-sm text-gray-500'><i class="bi bi-calendar3"></i>Joined September 2020</p>
            <div className='bg-base-200 p-4 rounded-xl grid grid-cols-1 gap-2'>
               <div className='flex gap-3 text-sm items-center'>
                  <p><span className='text-base-content'>31</span> Following</p>
                  <p><span className='text-base-content'>69M</span> Followers</p>
               </div>
               <div>
                  Wait random user, here I come!!!!
               </div>
            </div>
         </div>
      </div>
   )
}
