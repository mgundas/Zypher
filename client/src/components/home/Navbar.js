// misc imports
import React from 'react'
import { useSelector } from 'react-redux'

// module imports
import ToggleDarkMode from '../ToggleDarkMode';
import { LanguageButton } from './navbar/LanguageButton';
import { NotificationButton } from './navbar/NotificationButton';
import { ProfileButton } from './navbar/ProfileButton';

export const Navbar = () => {
   const { translation } = useSelector(state => state.translation)


   return (
      <div className="navbar">
         <div className="navbar-start">
            <div className="flex items-center">
               <p className='text-xs'>Chat person data goes here...</p>
            </div>
         </div>
         <div className="navbar-center hidden sm:block">
            <button className="btn btn-ghost text-xl" >{translation.content.title}</button>
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
