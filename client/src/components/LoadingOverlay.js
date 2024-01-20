import React, { useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const LoadingOverlay = ({ children }) => {
  const { oVisible } = useAuth()

  const overlayRef = useRef(null)

  useEffect(() => {
    if (oVisible === true) {
      overlayRef.current.classList.remove("hidden")
    } else {
      overlayRef.current.classList.add("hidden")
    }
  }, [oVisible])

  return (
    <>
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
    </>
  );
};
