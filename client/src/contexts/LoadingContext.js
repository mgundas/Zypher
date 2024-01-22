import React, { useRef, createContext, useEffect, useContext, useState } from "react";

const LoadingContext = createContext();

export const useLoading = () => {
  return useContext(LoadingContext)
}

export const LoadingProvider = ({ children }) => {
  const [visible, setVisible] = useState(true)

  const overlayRef = useRef(null)

  useEffect(() => {
    if (visible === true) {
      overlayRef.current.classList.remove("hidden")
    } else {
      overlayRef.current.classList.add("hidden")
    }
  }, [visible])

  return (
    <LoadingContext.Provider value={{setVisible}}>
      <div
        ref={overlayRef}
        className="absolute w-screen h-screen bg-rtca-900/80 z-50 flex items-center justify-center select-none"
      >
        <div
          role="status"
          className="flex flex-col gap-1 text-white items-center justify-center"
        >
          <span className="loading loading-spinner text-info loading-lg"></span>
          {/* <span className="font-medium"></span> */}
        </div>
      </div>
      {children}
    </LoadingContext.Provider>
  );
};
