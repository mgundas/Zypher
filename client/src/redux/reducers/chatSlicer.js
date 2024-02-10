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

function arrayUnique(array) {
   var a = array.concat();
   for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
         if (a[i] === a[j])
            a.splice(j--, 1);
      }
   }

   return a;
}

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
         const newMessagesArray = [...new Set(action.payload.messages)]
         state.messages = newMessagesArray
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
      addMessageEnd: (state, action) => {
         const newMessagesArray = [...new Set(arrayUnique([...state.messages, action.payload]))]
         console.log(newMessagesArray)
         state.messages = newMessagesArray;
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
      addMessageStart: (state, action) => {
         const unique = [...new Set(arrayUnique(action.payload.messages.concat(state.messages)))]
         const newMessagesArray = unique
         console.log(newMessagesArray)
         state.messages = newMessagesArray;
         state.loadedMessagesCount = newMessagesArray.length;
         state.totalMessagesCount = action.payload.total
      },
   },
});

export const { setRecipientData, setMessages, addMessageEnd, addMessageStart, addLoadedMessagesCount, setTotalMessagesCount, setChatId } = chatSlicer.actions;
export default chatSlicer.reducer;  