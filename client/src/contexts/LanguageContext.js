import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
	return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(localStorage.getItem("locale") || "en_US")
	const [langData, setLangData] = useState({})
	const availableLangs = new Map([
		[0, ["en_US", "English"]],
		[1, ["tr_TR", "Turkish"]],
	])

	useEffect(() => {
		const fetchLangFile = async () => {
			if (language) {
				try {
					const data = await import(`../lang/${language}.json`)
					setLangData(data);
				} catch (error) {
					console.log("An error occured while importing the language file.", error.message);
				}
			}
		}
		fetchLangFile()
		return () => {

		}
	}, [language])


	return (
		<LanguageContext.Provider value={{ setLanguage, availableLangs, langData }}>
			{children}
		</LanguageContext.Provider>
	)
}