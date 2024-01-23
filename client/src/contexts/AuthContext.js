// AuthContext.js
import React, {
   createContext,
   useContext,
   useEffect,
   useRef,
   useState,
} from "react";
import { useConfig } from "./ConfigContext";
import { useLoading } from "./LoadingContext"
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setRefreshToken, setLoggedIn, setAuthLoading } from '../redux/reducers/authSlicer';
import { setUserData } from "../redux/reducers/userSlicer";

const AuthContext = createContext();

export const useAuth = () => {
   return useContext(AuthContext);
};

export function AuthProvider({ children }) {
   const config = useConfig()
   const { setVisible } = useLoading();
   const dispatch = useDispatch();
   const checkInterval = 18000;

   const { accessToken, refreshToken, isLoggedIn, authLoading } = useSelector(state => state.auth);
   const intervalRef = useRef(null)

   /*    const handleLogin = () => {
         dispatch(setAccessToken('your_access_token'));
         dispatch(setRefreshToken('your_refresh_token'));
         dispatch(setLoggedIn(true));
      };
   
      const handleLogout = () => {
         dispatch(setAccessToken(null));
         dispatch(setRefreshToken(null));
         dispatch(setLoggedIn(false));
      }; */

   const verifyAccessToken = async () => {
      const headers = {
         headers: {
            Authorization: `${accessToken}`
         }
      }
      setVisible(true)
      dispatch(setAuthLoading(true))

      try {
         const response = await axios.post(`${config.apiUri}/verify-access-token`, {}, headers);
         if (response.data.success) {
            console.log(response.data);
            // Implement user data storage logic
            dispatch(setUserData(response.data.user))
            dispatch(setLoggedIn(true))
            return true
         } else {
            console.log(response.data);
            return false
         }
      } catch (err) {
         if (process.env.NODE_ENV === "development") console.log(`An error occured within the AuthContext, verifyAccessToken`, err.message);
      } finally {
         setVisible(false)
         dispatch(setAuthLoading(false))
      }
   }

   const refreshTokens = async () => {
      const headers = {
         headers: {
            Authorization: `${refreshToken}`
         }
      }
      setVisible(true)
      dispatch(setAuthLoading(true))

      try {
         const response = await axios.post(`${config.apiUri}/refresh-tokens`, { accessToken: accessToken }, headers)

         console.log(response);
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
   }

   const handleVerification = async () => {
      const isAccTokenValid = await verifyAccessToken();
      console.log(isAccTokenValid);
      if (isAccTokenValid) {
         // dispatch(setLoggedIn(true))
         // If the access token is valid, start the interval to check the validity periodically.
         clearInterval(intervalRef.current)
         intervalRef.current = setInterval(async () => {
            const check = await verifyAccessToken();
            console.log(check);
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
   }

   useEffect(() => {
      if (refreshToken && accessToken) {
         handleVerification();
      } else {
         dispatch(setLoggedIn(false))
      }

      return () => {
         clearInterval(intervalRef.current)
      }
   }, [accessToken, refreshToken, dispatch])


   return (
      <AuthContext.Provider
         value={{
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
