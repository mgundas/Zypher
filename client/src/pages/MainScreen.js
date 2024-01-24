import React from 'react'
import { useNavigate } from'react-router-dom'

export const MainScreen = () => {
  const navigate = useNavigate()

  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <p className='text-lg'>Hey there! Isn't it a nice day to chat someone?</p>
        <div className='flex'>
          <button onClick={() => {navigate("/discover", {replace:true})}} className='btn btn-outline btn-success'>
            Discover
          </button>
        </div>
      </div>
    </div>
  )
}
