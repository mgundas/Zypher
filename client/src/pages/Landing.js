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
      <div className="hero min-h-screen">
         <div className="hero-overlay bg-opacity-60" style={{ backgroundImage: "url(/landing-bg.png)" }}></div>
         <div className="hero-content text-center text-neutral-content">
            <div className="max-w-lg">
               <h1 className="mb-5 text-5xl font-bold">Welcome to Zypher</h1>
               <p className="mb-5">With Zypher, you can discover new people, find people you already know, chat and have fun!</p>
               <button onClick={() => {
                  window.history.pushState(null, '', '/landing');
                  navigate("/login")
               }} className="btn btn-primary">Login / Sign Up</button>
            </div>
         </div>
         <div className="toast toast-start hidden sm:flex">
            <div className="alert bg-rtca-950/75">
               <span>Made with ❤️ by <a className='link link-hover link-success' href='https://github.com/mgundas'>Mehmet Gündaş</a></span>
            </div>
            <div className="alert bg-rtca-950/75">
               <span>Background by <a className='link link-hover link-info' href='https://brunty.me/post/got-bored-made-security-focused-chat-backgrounds/'>Brunty</a></span>
            </div>
         </div>
      </div>)
}
