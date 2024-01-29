// misc imports
import React from 'react'
import { useSelector } from 'react-redux'

// module imports
import ToggleDarkMode from '../ToggleDarkMode';
import { LanguageButton } from './navbar/LanguageButton';
import { NotificationButton } from './navbar/NotificationButton';
import { ProfileButton } from './navbar/ProfileButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatPerson } from './navbar/ChatPerson';

export const Navbar = () => {
   const { translation } = useSelector(state => state.translation)
   const { recipientData } = useSelector(state => state.chat)
   const navigate = useNavigate()
   const location = useLocation();

   return (
      <div className="navbar justify-between">
         <div className="navbar-start w-3/4 sm:w-1/2">
            <div className="flex items-center">
               <div className="drawer w-auto">
                  <input
                     id="senderListDrawer"
                     type="checkbox"
                     className="drawer-toggle"
                  />
                  <label
                     htmlFor="senderListDrawer"
                     className="btn btn-circle btn-ghost text-xl"
                  >
                     <i className="bi bi-list"></i>
                  </label>
                  <div className="drawer-side z-10">
                     <label
                        htmlFor="senderListDrawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                     ></label>
                     <div className="w-80 flex flex-col min-h-full bg-rtca-900">
                        <div className="p-5 font-medium text-center">Convos</div>
                        <div className="flex flex-1 flex-col">
                           <button
                              className="p-4 flex gap-2 items-center hover:bg-rtca-500/50 transition-all"
                           >
                              <div
                                 style={{
                                    backgroundColor: "green",
                                 }}
                                 className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10"
                              >
                                 S
                              </div>
                              <div className="grid grid-rows-2 text-sm">
                                 <div className="font-medium text-left">Someone</div>
                                 <span className="">Last message goes here...</span>
                              </div>
                           </button>
                        </div>
                        <button
                           className="p-4 bg-green-800 hover:bg-green-500/50 transition-all"
                        >
                           New
                        </button>
                     </div>
                  </div>
               </div>
               {/* If a conversation is active, attach the recipient info to the navbar */}
               {location.pathname.startsWith("/chat") && recipientData.username !== "" ? (<ChatPerson />) : (<></>)}
            </div>
         </div>
         <div className="navbar-center hidden sm:block">
            <button onClick={() => { window.history.pushState(null, '', location.pathname); navigate("/") }} className="btn btn-ghost text-xl" >{translation.content.title}</button>
         </div>
         <div className="navbar-end gap-2">
            <LanguageButton />
            <ToggleDarkMode />
            <NotificationButton />
            <ProfileButton />
         </div>
      </div>
   );

}
