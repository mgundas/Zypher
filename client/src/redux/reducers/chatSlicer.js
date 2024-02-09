import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   idChat: "",
   recipientData: {
      username: "",
      _id: "",
      email: "",
      isOnline: "",
      createdAt: "",
   },
   messages: [],
   messagesCount: 0,
   loadedMessagesCount: 0,
   totalMessagesCount: 0,
};

const chatSlicer = createSlice({
   name: 'chat',
   initialState,
   reducers: {
      setChatId: (state, action) => {
         state.idChat = action.payload; 
      },
      setRecipientData: (state, action) => {
         state.recipientData = action.payload;
      },
      setMessages: (state, action) => {
         state.messages = [...new Set(action.payload)];
      },
      addMessageEnd: (state, action) => {
         state.messages = [...new Set([...state.messages, action.payload])];
      },
      addMessageStart: (state, action) => {
         state.messages = [...new Set([...action.payload, ...state.messages])];
      },
      addLoadedMessagesCount: (state, action) => {
         state.loadedMessagesCount = state.loadedMessagesCount + action.payload;
      },
      setTotalMessagesCount: (state, action) => {
         state.totalMessagesCount = action.payload;
      },
      addTotalMessagesCount: (state, action) => {
         state.totalMessagesCount = state.totalMessagesCount + action.payload;
      },
   },
});

export const { setRecipientData, setMessages, addMessageEnd, addMessageStart, addLoadedMessagesCount, setTotalMessagesCount, addTotalMessagesCount, setChatId } = chatSlicer.actions;
export default chatSlicer.reducer;  