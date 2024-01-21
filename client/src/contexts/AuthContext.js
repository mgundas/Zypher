// AuthContext.js
import React, {
   createContext,
   useContext,
   useEffect,
   useRef,
   useState,
} from "react";
import { useConfig } from "./ConfigContext";
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
   return useContext(AuthContext);
};

export function AuthProvider({ children }) {
   const config = useConfig();
   const [authToken, setAuthToken] = useState(
      localStorage.getItem("accessToken") || null
   );
   const [refreshToken, setRefreshToken] = useState(
      localStorage.getItem("refreshToken") || null
   );
   const [loggedIn, setLoggedIn] = useState(false);
   const [userData, setUserData] = useState({});
   const [oVisible, setOVisible] = useState(true);
   const checkTimeout = useRef(null);

   const handleOffline = () => {
      setOVisible(true)
   };

   const handleOnline = () => {
      setOVisible(false)
   };

   // Check the access token validity on component mount
   useEffect(() => {
      const verifyAccessToken = async () => {
         try {
            const response = await fetch(`${config.apiUri}/verify-access-token`, {
               method: "POST",
               headers: {
                  Authorization: `${authToken}`,
               },
            });
            const data = await response.json();
            if (!response.ok) {
               return false;
            }
            if (!data.success) {
               return false;
            } else {
            }
            if (process.env.NODE_ENV === 'development') {
               console.log(`Token verification: ${data.success}`);
            }

            setUserData(data.user);
            return true;
         } catch (error) {
            return false;
         }
      };

      const refreshTokens = async () => {
         try {
            setOVisible(true);
            axios.post(config.apiUri + "/refresh-tokens", {
               accessToken: authToken,
            }, {
               headers: {
                  Authorization: `${refreshToken}`,
               },
            })
               .then(response => {
                  if (response.data.success === true) {
                     const { accessToken: newAccessToken, refreshToken: newRefreshToken } =  response.data;
                     localStorage.setItem("accessToken", newAccessToken);
                     localStorage.setItem("refreshToken", newRefreshToken);
                     setAuthToken(newAccessToken);
                     setRefreshToken(newRefreshToken);
                  } else {
                     localStorage.setItem("accessToken", "");
                     localStorage.setItem("refreshToken", "");
                     setAuthToken("");
                     setRefreshToken("");
                     setLoggedIn(false);
                  }
               })
               .catch(err => {
                  if (process.env.NODE_ENV === 'development') {
                     console.error("An error occured within the AuthContext module.", err.message);
                  }
               })
               .finally(() => {
                  setOVisible(false);
               })
         } catch (err) {
            if (process.env.NODE_ENV === 'development') {
               console.error("An error occured within the AuthContext module.", err.message);
            }
            localStorage.setItem("accessToken", "");
            localStorage.setItem("refreshToken", "");
            setAuthToken("");
            setRefreshToken("");
            setLoggedIn(false);
         }
      };

      const checkVerification = () => {
         verifyAccessToken().then((isValid) => {
            if (!isValid) {
               // Access token is invalid, attempt to refresh tokens

               return refreshTokens();
            }
            setOVisible(false)
            setLoggedIn(true);
         });
      };

      if (authToken) {
         window.addEventListener("online", handleOnline);
         window.addEventListener("offline", handleOffline);
         checkVerification();
         checkTimeout.current = setInterval(() => {
            checkVerification();
         }, 45000);
      } else {
         setOVisible(false);
         setLoggedIn(false);
      }
      return () => {
         clearInterval(checkTimeout.current);
         window.removeEventListener("online", handleOnline);
         window.removeEventListener("offline", handleOffline);
      };
   }, [authToken, refreshToken, config.apiUri]);

   const logOut = () => {
      const requestBody = {
         accessToken: authToken
      }

      axios.post(`${config.apiUri}/logout`, requestBody, {
         headers: {
            Authorization: `${refreshToken}`,
         },
      })
         .then(response => {
            if (response.status === 200) {
               localStorage.setItem("accessToken", "");
               localStorage.setItem("refreshToken", "");
               setAuthToken("");
               setRefreshToken("");
               setLoggedIn(false);
            } else {
               window.location.reload(false);
            }
         })
         .catch(err => {
            window.location.reload(false);
         })
   }

   return (
      <AuthContext.Provider
         value={{
            authToken,
            refreshToken,
            setAuthToken,
            setRefreshToken,
            logOut,
            loggedIn,
            userData,
            oVisible
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
