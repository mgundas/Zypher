import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   locale: localStorage.getItem('locale') || "en_US",
   translation: {},
   avalableLangs: Object.fromEntries(new Map([
		[0, ["en_US", "English"]],
		[1, ["tr_TR", "Türkçe"]],
	])),
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