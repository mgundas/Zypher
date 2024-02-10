import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   chatId: "",
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


function arrayUnique(array) {
   return Array.from(new Set(array.map(JSON.stringify)), JSON.parse);
}

const chatSlicer = createSlice({
   name: 'chat',
   initialState,
   reducers: {
      setChatId: (state, action) => {
         state.chatId = action.payload;
      },
      setRecipientData: (state, action) => {
         state.recipientData = action.payload;
      },
      setMessages: (state, action) => {
         const newMessagesArray = [...new Set(action.payload.messages)]
         state.messages = newMessagesArray
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
      addMessageEnd: (state, action) => {
         const newMessagesArray = [...new Set(arrayUnique(state.messages.concat(action.payload)))]
         state.messages = newMessagesArray;
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
      addMessageStart: (state, action) => {
         const newMessagesArray = [...new Set(arrayUnique(action.payload.messages.concat(state.messages)))]
         state.messages = newMessagesArray;
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
   },
});

export const { setRecipientData, setMessages, addMessageEnd, addMessageStart, addLoadedMessagesCount, setTotalMessagesCount, setChatId } = chatSlicer.actions;
export default chatSlicer.reducer;  