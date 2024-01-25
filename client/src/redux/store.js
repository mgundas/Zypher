// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlicer';
import userReducer from './reducers/userSlicer';
import languageReducer from './reducers/languageSlicer';
import socketReducer from './reducers/socketSlicer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    translation: languageReducer,
    socket: socketReducer,
  },
});

export default store;