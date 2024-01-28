// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlicer';
import userReducer from './reducers/userSlicer';
import languageReducer from './reducers/languageSlicer';
import chatReducer from './reducers/chatSlicer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    translation: languageReducer,
    chat: chatReducer,
  },
});

export default store;