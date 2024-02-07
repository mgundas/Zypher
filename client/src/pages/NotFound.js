import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export const NotFound = () => {
   const navigate = useNavigate()
   const location = useLocation();
   return (
      <div className="grid place-items-center pt-6 overflow-auto">
         <div className="hero-content text-center">
            <div className="max-w-md">
               <h1 className="text-5xl font-bold">404</h1>
               <p className="py-6">The page you're looking for does not exist. :/</p>
               <button onClick={() => {
                  window.history.pushState(null, '', location.pathname);
                  navigate("/")
               }} className="btn btn-primary">Home</button>
            </div>
         </div>
      </div>
   )
}
