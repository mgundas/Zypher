import { useEffect } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from "../components/home/Navbar";
import { MainScreen } from "./MainScreen";
import { Discover } from "./Discover";
import { Chat } from "./Chat";
import { NotFound } from "./NotFound";
import { Profile } from "./Profile";

export default function Home() {
   const { isLoggedIn, authLoading } = useSelector(state => state.auth);
   const navigate = useNavigate();

   // Check if the user is logged in, otherwise redirect to the login page
   useEffect(() => {
      if (!authLoading) {
         if (!isLoggedIn) {
            window.history.pushState(null, '', '/');
            navigate("/landing", { replace: true })
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
               <Route path="chat/:username" element={<Chat />} />
               <Route path="profile/:username" element={<Profile />} />
               
               {/* For all the routes that don't exist */}
               <Route path="*" element={<NotFound />} />
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
