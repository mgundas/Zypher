import React, { createContext, useContext } from "react";

const MessageStoreContext = createContext();

export const useMessageStore = () => {
	return useContext(MessageStoreContext);
};

export const MessageStoreProvider = ({ children }) => {

	return (
		<MessageStoreContext.Provider>
			{children}
		</MessageStoreContext.Provider>
	)
}