import { useEffect } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from "../components/home/Navbar";
import { MainScreen } from "./MainScreen";
import { Discover } from "./Discover";

export default function Home() {
   const { isLoggedIn, authLoading } = useSelector(state => state.auth);
   const navigate = useNavigate();

   // Check if the user is logged in, otherwise redirect to the login page
   useEffect(() => {
      if (!authLoading) {
         if (!isLoggedIn) {
            navigate("/login", { replace: true })
         }
      }
   }, [authLoading, isLoggedIn, navigate])

   if (!authLoading && isLoggedIn) {
      return (
         <div className="chat-screen">
            <Navbar />
            <Routes>
               <Route exact path="/" element={<MainScreen />} />
               <Route path="discover" element={<Discover />} />
               <Route path="chat/:username" element={<div>It's the chat, init?</div>} />
               <Route path="/:username" element={<div>It's the profile, init?</div>} />
            </Routes>
         </div>
      )
   } else {
      return (
         <div className="chat-screen">
            <div className="flex flex-1 items-center justify-center">Waiting circuits engaged... waiting for initialization.</div>
         </div>
      )
   }
}
