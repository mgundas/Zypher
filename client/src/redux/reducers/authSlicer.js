import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   accessToken: localStorage.getItem("accessToken") || null,
   refreshToken: localStorage.getItem("refreshToken") || null,
   authLoading: false,
   loggedIn: false,
};

const authSlicer = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      setAccessToken: (state, action) => {
         if(action.payload === null) return localStorage.removeItem("accessToken")
         localStorage.setItem("accessToken", action.payload);
         state.accessToken = action.payload;
      },
      setRefreshToken: (state, action) => {
         if(action.payload === null) return localStorage.removeItem("refreshToken")
         localStorage.setItem("refreshToken", action.payload);
         state.refreshToken = action.payload;
      },
      setLoggedIn: (state, action) => {
         state.isLoggedIn = action.payload;
      },
      setAuthLoading: (state, action) => {
         state.authLoading = action.payload;
      },
   },
});

export const { setAccessToken, setRefreshToken, setLoggedIn, setAuthLoading } = authSlicer.actions;
export default authSlicer.reducer;  // Default export of the reducer
