import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'

export const Register = ({ sendInfoMessage }) => {
   const { authLoading, isLoggedIn } = useSelector(state => state.auth)
   const { translation } = useSelector(state => state.translation)
   const { apiUri } = useSelector(state => state.globals)
   const navigate = useNavigate();

   const [emailInput, setEmailInput] = useState("");
   const [usernameInput, setUsernameInput] = useState("");
   const [passwordInput, setPasswordInput] = useState("");

   const timeoutRef = useRef(null)

   useEffect(() => {
      if (!authLoading) {
         if (isLoggedIn) {
            window.history.pushState(null, '', '/landing/signup');
            navigate("/")
         }
      }
   }, [navigate, authLoading, isLoggedIn]);

   useEffect(() => {
      document.title = `${translation.content.landing.signup.signup} - ${translation.content.title}`;
      return () => {
         document.title = `${translation.content.title}`;
      };
   }, [translation.content.landing.signup.signup, translation.content.title]);

   const handleRegister = async (e) => {
      e.preventDefault();

      if (usernameInput.trim() !== "" && passwordInput.trim() !== "" && emailInput.trim() !== "") {
         try {
            const response = await fetch(`${apiUri}/register`, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ username: usernameInput, password: passwordInput, email: emailInput }),
            });

            const data = await response.json();

            if (!response.ok) {
               const infoData = translation.content.landing.signup.responseChart[data.message] || `${translation.content.common.error}|failure`;
               sendInfoMessage(infoData);
            } else {
               const infoData = translation.content.landing.signup.responseChart[data.message] || `${translation.content.common.error}|failure`;
               sendInfoMessage(infoData);
               setEmailInput("");
               setPasswordInput("");
               setUsernameInput("");
               clearTimeout(timeoutRef.current);
               timeoutRef.current = setTimeout(() => {
                  window.history.pushState(null, '', '/landing/signup');
                  navigate("/landing/signin")
               }, 2000);
            }
         } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error(`Something went wrong in /src/pages/Login.js. ${err.message}`);
            sendInfoMessage(`${translation.content.common.error}|failure`);
         }
      } else {
         sendInfoMessage(`${translation.content.common.error}|failure`);
      }

      return () => {
         clearTimeout(timeoutRef.current);
      }
   };

   return (
      <div className="sm:hero-content mt-6 sm:mt-0 flex-col lg:flex-row-reverse">
         <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Sign up to Zypher!</h1>
            <p className="py-6">This is a great chance to discover new people and maybe make some nice friendships.</p>
         </div>
         <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form className="card-body p-4 sm:p-8" onSubmit={handleRegister}>
               <div className="form-control">
                  <label className="label">
                     <span className="label-text">Username</span>
                  </label>
                  <input onChange={(e) => setUsernameInput(e.target.value)} value={usernameInput} type="text" minLength={6} maxLength={12} placeholder="Username" className="input input-bordered" required />
               </div>
               <div className="form-control">
                  <label className="label">
                     <span className="label-text">Email</span>
                  </label>
                  <input onChange={(e) => setEmailInput(e.target.value)} value={emailInput} type="email" placeholder="Email" className="input input-bordered" required />
               </div>
               <div className="form-control">
                  <label className="label">
                     <span className="label-text">Password</span>
                  </label>
                  <input onChange={(e) => setPasswordInput(e.target.value)} value={passwordInput} type="password" placeholder="Password" className="input input-bordered" required />
               </div>
               <div className="form-control mt-6">
                  <button className="btn btn-primary">Sign Up</button>
               </div>
            </form>
         </div>
         <button
            className="btn btn-ghost"
            onClick={() => {
               window.history.pushState(null, '', '/landing/signin');
               navigate("/landing")
            }}
         >
            Back to homepage
         </button>
      </div>
   )
}
