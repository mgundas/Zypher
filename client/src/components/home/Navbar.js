import React from 'react'
import { useSelector } from'react-redux'

import { generateRandomColor } from "../../helpers/generateRandomColor";
import { getInitials } from "../../helpers/getInitials";
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
   const { userData } = useSelector(state => state.user)
   const { translation } = useSelector(state => state.translation)
   const handleLogout = useAuth();

   return (
      <div className="navbar bg-base-100">
         <div className="navbar-start">
            <div className="flex items-center">
            </div>
         </div>
         <div className="navbar-center hidden sm:block">
            <button
               className="btn btn-ghost text-xl"
            >{translation.content.title}
            </button>
         </div>
         <div className="navbar-end gap-2">
            <div className="dropdown dropdown-start md:dropdown-end">
               <button tabIndex={0} className="btn btn-ghost btn-circle">
                  <i className="bi bi-translate text-lg"></i>
               </button>
               <div
                  tabIndex={0}
                  className="dropdown-content z-[1] card card-compact w-44 p-2 shadow bg-rtca-800 rounded-t-none"
               >
                  <div className="p-1 grid gap-2">
                     <h3 className="text-center text-md font-medium">{translation.content.navbar.languages}</h3>
                     <div className="overflow-y-auto overflow-x-hidden grid gap-1 max-h-[calc(100vh/2)]">
                     </div>
                  </div>
               </div>
            </div>
            <div className="dropdown dropdown-end">
               <button tabIndex={0} className="btn btn-ghost btn-circle">
                  <div className="indicator">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                     </svg>
                     <span className="badge badge-xs badge-primary indicator-item"></span>
                  </div>
               </button>
               <div
                  tabIndex={0}
                  className="dropdown-content z-[1] card card-compact w-72 p-2 shadow bg-rtca-800 rounded-t-none"
               >
                  <div className="p-1 grid gap-">
                     <h3 className="text-center text-lg font-medium">{translation.content.navbar.notifications}</h3>
                     <div className="overflow-y-auto overflow-x-hidden grid gap-1 max-h-[calc(100vh/2)]">
                     </div>
                  </div>
               </div>
            </div>
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
                     <button onClick={() => {handleLogout();}}>{translation.content.navbar.logout}</button>
                  </li>
               </ul>
            </div>
         </div>
      </div>
   );

}
