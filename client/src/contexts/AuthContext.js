// AuthContext.js
import React, {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useRef,
} from "react";
import { useConfig } from "./ConfigContext";
import { useLoading } from "./LoadingContext"
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setRefreshToken, setLoggedIn, setAuthLoading, setConnected } from '../redux/reducers/authSlicer';
import { setUserData } from "../redux/reducers/userSlicer";

const AuthContext = createContext();

export const useAuth = () => {
   return useContext(AuthContext);
};

export function AuthProvider({ children }) {
   // Hook definitions
   const config = useConfig()
   const { setVisible } = useLoading();
   const dispatch = useDispatch();

   // State definitions
   const { accessToken, refreshToken, connected } = useSelector(state => state.auth);
   const intervalRef = useRef(null)
   const checkInterval = 1000 * 60 * 30; // 30 minutes

   const verifyAccessToken = useCallback(async () => {
      const headers = {
         headers: {
            Authorization: `${accessToken}`
         }
      }
      dispatch(setAuthLoading(true))

      try {
         const response = await axios.post(`${config.apiUri}/verify-access-token`, {}, headers);
         if (response.data.success) {
            // Implement user data storage logic
            dispatch(setUserData(response.data.user))
            dispatch(setLoggedIn(true))
            return true
         } else {
            return false
         }
      } catch (err) {
         if (process.env.NODE_ENV === "development") console.log(`An error occured within the AuthContext, verifyAccessToken`, err.message);
      } finally {
         dispatch(setAuthLoading(false))
      }
   }, [accessToken, config.apiUri, dispatch])

   const refreshTokens = useCallback(async () => {
      const headers = {
         headers: {
            Authorization: `${refreshToken}`
         }
      }
      setVisible(true)
      dispatch(setAuthLoading(true))

      try {
         const response = await axios.post(`${config.apiUri}/refresh-tokens`, { accessToken: accessToken }, headers)
         if (response.data.success) {
            dispatch(setAccessToken(response.data.accessToken));
            dispatch(setRefreshToken(response.data.refreshToken));
            dispatch(setLoggedIn(true));
         } else {
            dispatch(setAccessToken(null));
            dispatch(setRefreshToken(null));
            dispatch(setLoggedIn(false));
         }
      } catch (err) {
         if (err.response && err.response.status === 401) {
            dispatch(setAccessToken(null));
            dispatch(setRefreshToken(null));
            dispatch(setLoggedIn(false));
         } else {
            // Handle other errors
            if (process.env.NODE_ENV === "development") console.log(`An error occurred within the AuthContext, verifyRefreshToken`, err.message);
         }
      } finally {
         setVisible(false)
         dispatch(setAuthLoading(false))
      }
   }, [accessToken, config.apiUri, dispatch, refreshToken, setVisible])

   const handleLogout = useCallback(async () => {
      try {
         const headers = {
            headers: {
               Authorization: `${refreshToken}`
            }
         }
         const body = {
            accessToken: accessToken
         }

         const response = await axios.post(`${config.apiUri}/logout`, body, headers)

         if (response.data.success) {
            dispatch(setAccessToken(null));
            dispatch(setRefreshToken(null));
            dispatch(setLoggedIn(false));
         } else {
            if (process.env.NODE_ENV === "development") console.log("AuthContext: An error occurred while logging out", response.data.message);
            window.location.reload();
         }
      } catch (err) {
         if (process.env.NODE_ENV === "development") console.log("AuthContext: An error occurred while logging out", err.message);
         window.location.reload();
      }
   }, [accessToken, config.apiUri, dispatch, refreshToken])

   const handleVerification = useCallback(async () => {
      const isAccTokenValid = await verifyAccessToken();
      if (isAccTokenValid) {
         // dispatch(setLoggedIn(true))
         // If the access token is valid, start the interval to check the validity periodically.
         clearInterval(intervalRef.current)
         intervalRef.current = setInterval(async () => {
            const check = await verifyAccessToken();
            if (check) {
               // dispatch(setLoggedIn(true))
            } else {
               refreshTokens();
            }
         }, checkInterval) // Adjust the interval as needed.
         dispatch(setLoggedIn(true))
      } else {
         refreshTokens();
      }
   }, [checkInterval, dispatch, refreshTokens, verifyAccessToken])

   useEffect(() => {
      if (refreshToken && accessToken) {
         handleVerification();
      } else {
         dispatch(setLoggedIn(false))
      }


      window.addEventListener('online', () => dispatch(setConnected(true)));
      window.addEventListener('offline', () => dispatch(setConnected(false)));

      return () => {
         window.removeEventListener('online', () => dispatch(setConnected(true)));
         window.removeEventListener('offline', () => dispatch(setConnected(false)));
         clearInterval(intervalRef.current)
      }
   }, [accessToken, refreshToken, dispatch, handleVerification])

   return (
      <AuthContext.Provider value={handleLogout}>
         {!connected ? (
            <div
               className="absolute w-screen h-screen bg-rtca-900 z-[51] flex items-center justify-center select-none"
            >
               <div
                  role="status"
                  className="flex flex-col gap-1 text-white items-center justify-center"
               >
                  <span className="loading loading-spinner text-info loading-lg"></span>
                  <span className="font-medium">Trying to reconnect...</span>
               </div>
            </div>
         ) : (
            <></>
         )}
         {children}
      </AuthContext.Provider>
   );
}
