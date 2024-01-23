import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   accessToken: localStorage.getItem("accessToken") || null,
   refreshToken: localStorage.getItem("refreshToken") || null,
   authLoading: false,
   loggedIn: false,
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      setAccessToken: (state, action) => {
         state.accessToken = action.payload;
      },
      setRefreshToken: (state, action) => {
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

export const { setAccessToken, setRefreshToken, setLoggedIn, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;  // Default export of the reducer
