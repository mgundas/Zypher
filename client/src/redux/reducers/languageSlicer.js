import { createSlice } from '@reduxjs/toolkit';
import { availableLanguages } from '../../lang/availableLanguages'

const initialState = {
   locale: localStorage.getItem('locale') || "en_US",
   translation: await import("../../lang/en_US.json"),
   // Add new languages here to make them available in the app
   availableLangs: availableLanguages
};

const languageSlicer = createSlice({
   name: 'language',
   initialState,
   reducers: {
      setTranslation: (state, action) => {
         state.translation = action.payload;
      },
      setLocale: (state, action) => {
         localStorage.setItem("locale", action.payload)
         state.locale = action.payload;
      },
   },
});

export const { setTranslation, setLocale } = languageSlicer.actions;
export default languageSlicer.reducer;  // Default export of the reducer