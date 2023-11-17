import React from "react";

export const LoadingOverlay = ({ reference }) => {
  return (
    <div
      ref={reference}
      className="absolute w-screen h-screen bg-rtca-900/80 z-50 flex items-center justify-center select-none"
    >
      <div
        role="status"
        className="flex flex-col gap-1 text-white items-center justify-center"
      >
        <span className="loading loading-spinner text-info loading-lg"></span>
        <span className="font-medium">Connecting</span>
      </div>
    </div>
  );
};
