// misc imports
import React from 'react'
import { useSelector } from 'react-redux'

// module imports
import ToggleDarkMode from '../ToggleDarkMode';
import { LanguageButton } from './navbar/LanguageButton';
import { NotificationButton } from './navbar/NotificationButton';
import { ProfileButton } from './navbar/ProfileButton';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
   const { translation } = useSelector(state => state.translation)
   const navigate = useNavigate()

   return (
      <div className="navbar">
         <div className="navbar-start">
            <div className="flex items-center">
               <p className='text-xs'></p>
            </div>
         </div>
         <div className="navbar-center">
            <button onClick={() => { navigate("/", { replace: true }) }} className="btn btn-ghost text-xl hidden sm:block" >{translation.content.title}</button>
            <button onClick={() => { navigate("/", { replace: true }) }} className="btn btn-ghost text-xl block sm:hidden" ><i className="bi bi-house-fill"></i></button>
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
