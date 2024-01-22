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

const AuthContext = createContext();

export const useAuth = () => {
   return useContext(AuthContext);
};

export function AuthProvider({ children }) {
   const { setVisible } = useLoading();
   const config = useConfig();

   const [authToken, setAuthToken] = useState(
      localStorage.getItem("accessToken") || null
   );
   const [refreshToken, setRefreshToken] = useState(
      localStorage.getItem("refreshToken") || null
   );
   const [loggedIn, setLoggedIn] = useState(false);
   const [userData, setUserData] = useState({});

   const checkTimeout = useRef(null);

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
            setVisible(true);
            axios.post(config.apiUri + "/refresh-tokens", {
               accessToken: authToken,
            }, {
               headers: {
                  Authorization: `${refreshToken}`,
               },
            })
               .then(response => {
                  if (response.data.success === true) {
                     const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
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
                  setVisible(false);
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
            setVisible(false)
            setLoggedIn(true);
         });
      };


      const handleOffline = () => {
         setVisible(true)
      };

      const handleOnline = () => {
         setVisible(false)
      };

      if (authToken) {
         window.addEventListener("online", e => handleOnline(e));
         window.addEventListener("offline", e => handleOffline(e));
         checkVerification();
         checkTimeout.current = setInterval(() => {
            checkVerification();
         }, 45000);
      } else {
         setVisible(false);
         setLoggedIn(false);
      }
      return () => {
         clearInterval(checkTimeout.current);
         window.removeEventListener("online", e => handleOnline(e));
         window.removeEventListener("offline", e => handleOffline(e));
      };
   }, [authToken, refreshToken, config.apiUri, setVisible]);

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
            userData
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
