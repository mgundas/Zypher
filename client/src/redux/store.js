// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlicer';  // Importing the default export
import userReducer from './reducers/userSlicer'

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

export default store;
