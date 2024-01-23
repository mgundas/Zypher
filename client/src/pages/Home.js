import { useEffect } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from "../components/home/Navbar";
import { MainScreen } from "./MainScreen";

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

   if(!authLoading){
      return (
         <div className="chat-screen">
            <Navbar />
            <Routes>
               <Route exact path="/" element={<MainScreen />} />
               <Route path="chat/:username" element={<div>It's the chat, init?</div>} />
               <Route path="profile/:username" element={<div>It's the profile, init?</div>} />
            </Routes>
         </div>
      )
   } else {
      return(
         <></>
      )
   }
}
