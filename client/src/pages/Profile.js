import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import axios from "axios"

export const Profile = () => {
   const { username } = useParams()
   const { apiUri } = useSelector(state => state.globals)
   const { accessToken } = useSelector(state => state.auth)
   const { locale } = useSelector(state => state.translation)
   const { userData } = useSelector(state => state.user)

   const [fetchedUser, setUserData] = useState({})
   const [loading, setLoading] = useState(false)

   const loaderRef = useRef(null)

   useEffect(() => {
      if (loading) loaderRef.current.classList.remove("hidden")
      if (!loading) loaderRef.current.classList.add("hidden")
   }, [loading])


   const timeConverter = useCallback((timestamp) => {
      // Convert the timestamp to a Date object
      const date = new Date(timestamp);

      // Get month and year
      const month = date.toLocaleString(locale.replace("_", "-"), { month: 'long' });
      const year = date.getFullYear();

      // Concatenate month and year
      return `${month} ${year}`;
   }, [locale])

   const fetchProfile = useCallback(async () => {
      try {
         setLoading(true)
         const response = await axios.get(`${apiUri}/profile`, {
            headers: {
               Authorization: `${accessToken}`
            },
            params: {
               username: username
            }
         })
         if (response.data.success) setUserData(response.data.user)

      } catch (err) {
         if (err.response.status !== 404) if (process.env.NODE_ENV === "development") console.error(`An error occured while fetching profile, ${err.message}`);
      } finally {
         setLoading(false)
      }
   }, [accessToken, apiUri, username])

   useEffect(() => {
      fetchProfile();
   }, [fetchProfile])

   const notFound = () => {
      return (
         <>
            <div className='h-40 w-full relative'>
               <div className='bg-base-100 h-40 w-full drop-shadow-2xl'></div>
               <div className="absolute sm:-bottom-[40%] left-4 -bottom-[36%] avatar h-32 w-32 overflow-hidden rounded-full ring-2 ring-base-100 bg-base-300">

               </div>
            </div>
            <div className='grid grid-cols-1 p-4 gap-2'>
               <div className='flex h-12 items-center justify-end gap-2'>
               </div>
               <div className=' flex flex-col'>
                  <h1 className='text-sm text-gray-500'>@{username}</h1>
               </div>
               <div className='bg-base-200 p-4 rounded-xl flex flex-col gap-2 items-center'>
                  <div className='font-bold text-2xl text-center'>
                     This profile does not exist.
                  </div>
                  <div className='font-normal text-center'>
                     Try searching for another.
                  </div>
               </div>
            </div>
         </>
      )
   }

   const userProfile = () => {
      return (
         <>
            <div className='h-40 w-full relative'>
               <img className='bg-green-800 h-40 w-full object-cover drop-shadow-2xl content' src='https://placehold.co/1920x1080' alt='cover' />
               <div className="absolute sm:-bottom-[40%] left-4 -bottom-[36%] avatar h-32 w-32 overflow-hidden rounded-full ring-2 ring-base-100">
                  <img src="https://placehold.co/500x500" alt="Profile" />
               </div>
            </div>
            <div className='grid grid-cols-1 p-4 gap-2'>
               <div className='flex h-12 items-center justify-end gap-2'>
                  {fetchedUser.username === userData.username ? (
                     <button className='btn'><i className="bi bi-pencil-square"></i></button>
                  ) : (
                     <button className='btn btn-accent'><i className="bi bi-chat-fill"></i></button>
                  )}
               </div>
               <div className=' flex flex-col'>
                  <h1 className='text-lg font-bold'>Mehmet Gündaş</h1>
                  <h1 className='text-sm text-gray-500'>@{fetchedUser.username}</h1>
               </div>
               <p className='flex gap-2 text-sm text-gray-500'><i className="bi bi-calendar3"></i>Joined {timeConverter(fetchedUser.createdAt)}</p>
               <div className='bg-base-200 p-4 rounded-xl grid grid-cols-1 gap-2'>
                  <div className='flex gap-3 text-sm items-center'>
                     <p><span className='text-base-content'>X</span> Following</p>
                     <p><span className='text-base-content'>X</span> Followers</p>
                  </div>
                  <div>
                     Some info
                  </div>
               </div>
            </div>
         </>
      )
   }

   return (
      <div className='flex flex-col flex-1 overflow-auto relative'>
         <div ref={loaderRef} className='bg-base-300/95 absolute z-20 h-full w-full flex justify-center items-center'>
            <span className="loading loading-spinner text-info loading-lg"></span>
         </div>
         {loading ? <></> : (Object.keys(fetchedUser).length > 0 ? userProfile() : notFound())}
      </div>
   )
}
