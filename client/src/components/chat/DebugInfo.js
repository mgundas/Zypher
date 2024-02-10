import React from 'react'
import { useSelector } from 'react-redux'

export const DebugInfo = ({hidden}) => {
   const { totalMessagesCount, loadedMessagesCount } = useSelector(state => state.chat)
   return (
      <div
         style={{
            display: hidden? "none" : "block",
         }}
         className='fixed top-20 left-20 z-50 p-2 bg-accent/80 text-black rounded-lg'
      >
         <p>Loaded messages: {loadedMessagesCount}</p>
         <p>Total messages: {totalMessagesCount}</p>
      </div>
   )
}
