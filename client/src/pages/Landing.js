import React, { useEffect, useRef, useState } from 'react'
import { Routes, useNavigate, Route } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { Login } from "./Login";
import { Register } from './Register';
import { DevInfo } from '../components/landing/DevInfo';

export const Landing = () => {
   const navigate = useNavigate();
   const { authLoading, isLoggedIn } = useSelector(state => state.auth)
   const { translation } = useSelector(state => state.translation)

   const infoBoxRef = useRef(null);
   const infoTimeoutRef = useRef(null);

   const [errorMsg, setErrorMsg] = useState("");

   useEffect(() => {
      if (!authLoading) {
         if (isLoggedIn) {
            window.history.pushState(null, '', '/login');
            navigate("/")
         }
      }
   }, [navigate, authLoading, isLoggedIn]);

   const sendInfoMessage = (data) => {
      const duration = 1000 * 2 // 2 seconds
      const [message, type] = data.split("|")
      const types = {
         success: "alert-success",
         failure: "alert-error",
         warning: "alert-warning",
         info: "alert-info",
      };

      infoBoxRef.current.className = `alert flex sm:grid text-clip overflow-x-clip w-3/4 sm:w-full m-auto ${types[type]}`;
      setErrorMsg(message);
      infoBoxRef.current.classList.remove("hidden");

      clearTimeout(infoTimeoutRef.current);
      infoTimeoutRef.current = setTimeout(() => {
         infoBoxRef.current.classList.add("hidden");
         infoBoxRef.current.classList.remove("flex");
         infoBoxRef.current.classList.remove("sm:grid");
      }, duration);
   };

   useEffect(() => {
      if (!authLoading) {
         if (isLoggedIn) {
            window.history.pushState(null, '', '/landing');
            navigate("/")
         }
      }
   }, [navigate, authLoading, isLoggedIn]);

   const Landing = () => {
      useEffect(() => {
         document.title = `${translation.content.landing.landing} - ${translation.content.title}`;
         return () => {
            document.title = 'Zypher';
         };
      }, []);

      return (
         <div className="text-center text-neutral-content">
            <div className="max-w-lg">
               <h1 className="mb-5 text-5xl font-bold">Welcome to Zypher</h1>
               <p className="mb-5">With Zypher, you can discover new people, find people you already know, chat and have fun!</p>
               <div className='grid gap-2'>
                  <div className="flex items-center justify-center gap-2">
                     <button onClick={() => {
                        window.history.pushState(null, '', '/landing');
                        navigate("/landing/signin")
                     }} className="btn btn-primary">Sign in</button>
                     <button onClick={() => {
                        window.history.pushState(null, '', '/landing');
                        navigate("/landing/signup")
                     }} className="btn btn-primary">Sign up</button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                     <button onClick={() => {
                        window.history.pushState(null, '', '/landing');
                        navigate("/changelog")
                     }} className="btn btn-accent">Changelog</button>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="hero min-h-screen">
         <div className="toast toast-bottom toast-center z-10">
            <div ref={infoBoxRef} className="hidden" >
               <span className='animate-marquee sm:animate-none'>{errorMsg}</span>
            </div>
         </div>
         <div className="hero-overlay bg-opacity-60" style={{ backgroundImage: "url(/landing-bg.png)" }}></div>
         <div className='hero-content flex-col'>
            <Routes>
               <Route path="/" element={<Landing />} />
               <Route path="/signin" element={<Login sendInfoMessage={sendInfoMessage} />} />
               <Route path="/signup" element={<Register sendInfoMessage={sendInfoMessage} />} />
            </Routes>
            <DevInfo />
         </div>
      </div>
   )
}
