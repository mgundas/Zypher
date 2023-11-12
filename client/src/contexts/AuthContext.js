// AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useConfig } from "./ConfigContext";
import { LoadingOverlay } from "../modules/LoadingOverlay";

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
  const checkTimeout = useRef(null);
  const loadingOverlay = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleLogout = async () => {};

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
        setLoggedIn(false);
      }
    } catch (error) {
      // Handle errors, such as network issues
    }
  };

  const checkVerification = () => {
    verifyAccessToken().then((isValid) => {
      if (!isValid) {
        // Access token is invalid, attempt to refresh tokens

        return refreshTokens();
      }
      loadingOverlay.current.classList.add("hidden");
      setLoggedIn(true);
    });
  };

  const handleOffline = () => {
    loadingOverlay.current.classList.remove("hidden");
  };

  const handleOnline = () => {
    loadingOverlay.current.classList.add("hidden");
  };

  // Check the access token validity on component mount
  useEffect(() => {
    if (authToken) {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      checkVerification();
      checkTimeout.current = setInterval(() => {
        console.log("checked");
        checkVerification();
      }, 60000);
    } else {
      loadingOverlay.current.classList.add("hidden");
      setLoggedIn(false);
    }
    return () => {
      clearInterval(checkTimeout.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [authToken]);

  // Your other authentication-related functions (login, logout, etc.)

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        setAuthToken,
        setRefreshToken,
        loggedIn,
        userData,
      }}
    >
      <LoadingOverlay reference={loadingOverlay} />
      {children}
    </AuthContext.Provider>
  );
}
