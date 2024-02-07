// misc imports
import React from 'react'
import { useSelector } from 'react-redux'
import { generateRandomColor } from "../../../helpers/generateRandomColor";
import { getInitials } from "../../../helpers/getInitials";

// context imports
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const ProfileButton = () => {
   const { userData } = useSelector(state => state.user)
   const { translation } = useSelector(state => state.translation)
   const handleLogout = useAuth();
   const navigate = useNavigate();
   const location = useLocation();

   return (
      <div className="dropdown dropdown-end">
         <div
            tabIndex={0}
            style={{
               backgroundColor: generateRandomColor(userData.username),
            }}
            className="relative online-alt p-2 rounded-full select-none text-center font-medium h-10 w-10 text-white"
         >
            {getInitials(userData.username)}
         </div>
         <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow bg-base-300 rounded-box rounded-t-none w-52"
         >
            <li>
               <button
                  className="justify-between"
                  onClick={() => {
                     window.history.pushState(null, '', location.pathname);
                     navigate(`/profile/${userData.username}`)
                  }}
               >
                  {translation.content.navbar.profile}
                  <span className="badge bg-base-100 border-none">{translation.content.common.new}</span>
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
