// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlicer';
import userReducer from './reducers/userSlicer';
import languageReducer from './reducers/languageSlicer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    translation: languageReducer,
  },
});

export default store;