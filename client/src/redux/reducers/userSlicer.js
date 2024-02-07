import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   userData: {}
};

const userSlicer = createSlice({
   name: 'user',
   initialState,
   reducers: {
      setUserData: (state, action) => {
         state.userData = action.payload;
      },
   },
});

export const { setUserData } = userSlicer.actions;
export default userSlicer.reducer;  // Default export of the reducer
