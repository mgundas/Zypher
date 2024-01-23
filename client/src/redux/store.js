// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlicer';  // Importing the default export

const store = configureStore({
  reducer: {
    auth: authReducer,  // Using the imported reducer
  },
});

export default store;
