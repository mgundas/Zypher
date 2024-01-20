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
        console.log("Token is verified.");

        setUserData(data.user);
        return true;
      } catch (error) {
        return false;
      }
    };

    const refreshTokens = async () => {
      // Implement logic to refresh tokens with your backend
      // You can make an API call with the refresh token to obtain new tokens
      try {
        // Make an API call to refresh tokens
        const response = await fetch(config.apiUri + "/refresh-tokens", {
          method: "POST",
          headers: {
            Authorization: `${refreshToken}`,
          },
        });

        if (response.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await response.json();
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
      } catch (error) {
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
      }, 60000);
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
      if(response.status === 200){
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
