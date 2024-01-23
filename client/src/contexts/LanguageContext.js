import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setTranslation } from '../redux/reducers/languageSlicer';

const LanguageContext = createContext();

export const useLanguage = () => {
	return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
	const { locale } = useSelector(state => state.translation)
	const dispatch = useDispatch()

	useEffect(() => {
		const fetchLangFile = async () => {
			if (locale) {
				try {
					const data = await import(`../lang/${locale}.json`)
					dispatch(setTranslation(data));
				} catch (err) {
					if (process.env.NODE_ENV === 'development') {
						console.log("An error occured while importing the language file.", err.message);
					}
				}
			} else {
				if (process.env.NODE_ENV === 'development') {
					console.error("An unknown error occured within the LanguageContext module.");
				}
			}
		}
		fetchLangFile()
	}, [dispatch, locale]) // Everytime the language state changes, run the function.


	return (
		<LanguageContext.Provider value={{}}>
			{children}
		</LanguageContext.Provider>
	)
}