import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   theme: localStorage.getItem("theme") || "dark", // Dark theme is default
   socketUri: "http://localhost/",
   apiUri: "http://localhost/api/v1",
};

const globalsSlicer = createSlice({
   name: 'globals',
   initialState,
   reducers: {
      setTheme: (state, action) => {
         localStorage.setItem("theme", action.payload)
         state.theme = action.payload;
      }
   },
});

export const { setTheme } = globalsSlicer.actions;
export default globalsSlicer.reducer;  // Default export of the reducer