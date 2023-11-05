// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {useConfig} from './ConfigContext'

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const config = useConfig()
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);

  const verifyAccessToken = async () => {

    function isTokenValid(token) {
      if (!token) {
        // Token is missing
        return false;
      }
    
      // Step 1: Decode the JWT
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodes base64 URL-encoded string
    
      // Step 2: Verify the expiration time
      const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds
      if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
        // Token has expired
        return false;
      }
    
      // Step 3: Verify the signature (if necessary)
      // You may need a library like `jsonwebtoken` to verify the signature with a public key or secret.
    
      // Token is valid
      return true;
    }

    // Implement logic to verify the access token with your backend
    // You can make an API call with the access token to check its validity
    try {
      // Make an API call with the access token to validate it
      const response = await fetch('/api/verify-access-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        // Access token is valid
        return true;
      }
      // Access token is invalid, handle accordingly
    } catch (error) {
      // Handle errors, such as network issues
    }
    return false;
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
      });
    }
  }, [authToken]);

  // Your other authentication-related functions (login, logout, etc.)

  return (
    <AuthContext.Provider value={{ authToken, refreshToken, setAuthToken, setRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
