import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { useNavigate } from "react-router-dom"

export const Profile = () => {
   const { username } = useParams()
   const navigate = useNavigate()
   const { apiUri, imgApi } = useSelector(state => state.globals)
   const { accessToken } = useSelector(state => state.auth)
   const { locale } = useSelector(state => state.translation)
   const { userData } = useSelector(state => state.user)

   const [fetchedUser, setUserData] = useState({})
   const [loading, setLoading] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [letterCounter, setLetterCounter] = useState(0)

   const [titleInput, setTitleInput] = useState("")


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
               <div className="absolute sm:-bottom-[40%] left-4 -bottom-[36%] avatar h-32 w-32 overflow-hidden rounded-full ring-2 ring-base-100 bg-base-300"></div>
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
               <div className="absolute sm:-bottom-[40%] left-4 -bottom-[36%] object-cover avatar h-32 w-32 overflow-hidden rounded-full ring-4 ring-base-100">
                  <img className=" object-contain" src={fetchedUser.profilePhoto ? `${imgApi}/uploads/${fetchedUser.profilePhoto}` : `${imgApi}/uploads/5c6cde67-6143-4b94-b08c-0f8a897e1e5c.jpg`} alt="Profile" />
               </div>
               {isEditing ? 
               <button className="absolute flex items-center justify-center sm:-bottom-[40%] bg-base-300/60 hover:bg-base-300/75 transition-all left-4 -bottom-[36%] h-32 w-32 overflow-hidden rounded-full ring-4 ring-base-100">
                  <i className="bi bi-camera text-white text-2xl"></i>
               </button>:<></>}
            </div>
            <div className='grid grid-cols-1 p-4 gap-2'>
               <div className='flex h-12 items-center justify-end gap-2'>
                  {fetchedUser.username === userData.username ? isEditing ? (
                     <button onClick={() => { setIsEditing(prev => !prev) }} className='btn btn-accent'><i className="bi bi-floppy text-"></i></button>
                  ) : (
                     <button onClick={() => { setIsEditing(prev => !prev) }} className='btn'><i className="bi bi-pencil-square"></i></button>
                  ) : (
                     <button onClick={() => {
                        window.history.pushState(null, '', `/profile/${fetchedUser.username}`)
                        navigate(`/chat/${fetchedUser.username}`)
                     }} className='btn btn-accent'><i className="bi bi-chat-fill"></i></button>
                  )}
               </div>
               <div className=' flex flex-col'>
                  {isEditing ? (
                     <input type="text" onChange={e => {setTitleInput(e.target.value)}} value={titleInput} placeholder="Profile title" className="input my-1 input-bordered w-full" />
                  ) : (
                     <h1 className='text-lg font-bold'>{String(fetchedUser.profileTitle)}</h1>
                  )}
                  <h1 className='text-sm text-gray-500'>@{fetchedUser.username}</h1>
               </div>
               <p className='flex gap-2 text-sm text-gray-500'><i className="bi bi-calendar3"></i>Joined {timeConverter(fetchedUser.createdAt)}</p>
               <div className='bg-base-200 p-4 rounded-xl grid grid-cols-1 gap-2'>
                  {/* 
                     <div className='flex gap-3 text-sm items-center'>
                        <p><span className='text-base-content'>X</span> Following</p>
                        <p><span className='text-base-content'>X</span> Followers</p>
                     </div>
                  */}
                  <div>
                     {isEditing ? (
                        <label className="form-control">
                           <div className="label">
                              <span className="label-text">Your bio</span>
                              <span className={`label-text-alt ${letterCounter >= 125 ? `text-warning` : `text-base-content`}`}>{letterCounter}/150</span>
                           </div>
                           <textarea onChange={e => {setLetterCounter(e.target.value.length)}} value={fetchedUser.bio} maxLength={150} className="textarea textarea-bordered h-24" placeholder="Bio"></textarea>
                           <div className="label">
                              <span className="label-text-alt"></span>
                           </div>
                        </label>
                     ) : (<>No info.</>)}
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
