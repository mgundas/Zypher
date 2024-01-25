import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   locale: localStorage.getItem('locale') || "en_US",
   translation: await import("../../lang/en_US.json"),
   availableLangs: [
      {
         locale: "en_US",
         language: "English"
      },
      {
         locale: "tr_TR",
         language: "Türkçe"
      },
      {
         locale: "de_DE",
         language: "Deutsch"
      }
   ]
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