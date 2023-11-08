// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {useConfig} from './ConfigContext'

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const config = useConfig()
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loggedIn, setLoggedIn] = useState(false);

  const verifyAccessToken = async () => {
    try {
      const response = await fetch(`${config.apiUri}/verify-access-token`, {
        method: 'POST',
        headers: {
          Authorization: `${authToken}`,
        },
      });
      const data = await response.json()
      if (!response.ok) {
        return false;
      }
      if (!data.success){
        return false;
      }
      console.log("Token is verified.");
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
      const response = await fetch('/api/refresh-tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const { authToken: newAuthToken, refreshToken: newRefreshToken } = await response.json();
        setAuthToken(newAuthToken);
        setRefreshToken(newRefreshToken);
      } else {
        // Handle token refresh failure
      }
    } catch (error) {
      // Handle errors, such as network issues
    }
  };

  // Check the access token validity on component mount
  useEffect(() => {
    if (authToken) {
      verifyAccessToken().then((isValid) => {
        if (!isValid) {
          // Access token is invalid, attempt to refresh tokens
          refreshTokens();
        }
        setLoggedIn(true);
      });
    }
  }, [authToken]);

  // Your other authentication-related functions (login, logout, etc.)

  return (
    <AuthContext.Provider value={{ authToken, refreshToken, setAuthToken, setRefreshToken, loggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
