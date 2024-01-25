import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   socket: undefined
};

const socketSlicer = createSlice(
   {
      name:'socket',
      initialState,
      reducers: {
         setSocket: (state, action) => {
            state.socket = action.payload;
         },
      },
   }
)

export const { setSocket } = socketSlicer.actions;
export default socketSlicer.reducer;