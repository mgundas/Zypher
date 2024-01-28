import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';

export const Landing = () => {
   const navigate = useNavigate()
   const { authLoading, isLoggedIn } = useSelector(state => state.auth)

   useEffect(() => {
      document.title = 'Welcome - Zypher';
      return () => {
         document.title = 'Zypher';
      };
   }, []);

   useEffect(() => {
      if (!authLoading) {
        if (isLoggedIn) {
          window.history.pushState(null, '', '/landing');
          navigate("/")
        }
      }
    }, [navigate, authLoading, isLoggedIn]);

   return (
      <div class="hero min-h-screen">
         <div class="hero-overlay bg-opacity-60"></div>
         <div class="hero-content text-center text-neutral-content">
            <div class="max-w-lg">
               <h1 class="mb-5 text-5xl font-bold">Welcome to Zypher</h1>
               <p class="mb-5">With Zypher, you can discover new people, find people you already know, chat and have fun!</p>
               <button onClick={() => {
                  window.history.pushState(null, '', '/landing');
                  navigate("/login")
               }} class="btn btn-primary">Login / Sign Up</button>
            </div>
         </div>
      </div>)
}
