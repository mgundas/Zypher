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
         state.messages = action.payload;
      },
      setMessagesCount: (state, action) => {
         state.messagesCount = action.payload;
      },
      setLoadedMessagesCount: (state, action) => {
         state.loadedMessagesCount = action.payload;
      },
      setTotalMessagesCount: (state, action) => {
         state.totalMessagesCount = action.payload;
      },
   },
});

export const { setRecipientData, setMessages, setMessagesCount, setLoadedMessagesCount, setTotalMessagesCount, setChatId } = chatSlicer.actions;
export default chatSlicer.reducer;  