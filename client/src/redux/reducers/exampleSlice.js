// reducers/exampleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  exampleData: null,
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    updateExampleData: (state, action) => {
      state.exampleData = action.payload;
    },
  },
});

export const { updateExampleData } = exampleSlice.actions;
export default exampleSlice.reducer;  // Default export of the reducer
