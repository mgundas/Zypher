// misc imports
import React from 'react'
import { useSelector } from 'react-redux'
import { generateRandomColor } from "../../../helpers/generateRandomColor";
import { getInitials } from "../../../helpers/getInitials";

// context imports
import { useAuth } from '../../../contexts/AuthContext';

export const ProfileButton = () => {
   const { userData } = useSelector(state => state.user)
   const handleLogout = useAuth();
   const { translation } = useSelector(state => state.translation)

   return (
      <div className="dropdown dropdown-end">
         <div
            tabIndex={0}
            style={{
               backgroundColor: generateRandomColor(userData.username),
            }}
            className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10 "
         >
            {getInitials(userData.username)}
         </div>
         <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-rtca-800 rounded-box rounded-t-none w-52"
         >
            <li>
               <button className="justify-between">
                  {translation.content.navbar.profile}
                  <span className="badge bg-rtca-700 border-none">{translation.content.common.new}</span>
               </button>
            </li>
            <li>
               <button>{translation.content.navbar.settings}</button>
            </li>
            <li>
               <button onClick={() => { handleLogout(); }}>{translation.content.navbar.logout}</button>
            </li>
         </ul>
      </div>)
}
