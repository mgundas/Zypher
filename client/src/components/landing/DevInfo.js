import React from 'react'

export const DevInfo = () => {
   return (
      <div className="grid gap-4 !content-end sm:toast sm:toast-end">
         <div className="alert bg-rtca-950/75">
            <span>Made with ❤️ by <a className='link link-hover link-success' href='https://github.com/mgundas'>Mehmet Gündaş</a></span>
         </div>
         <div className="alert bg-rtca-950/75">
            <span>Background by <a className='link link-hover link-info' href='https://brunty.me/post/got-bored-made-security-focused-chat-backgrounds/'>Brunty</a></span>
         </div>
      </div>
   )
}
