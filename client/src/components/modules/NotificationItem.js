import React from "react";
import { generateRandomColor } from "../../helpers/generateRandomColor";
import { getInitials } from "../../helpers/getInitials";

export const NotificationItem = ({ notficiationData }) => {
  return (
    <div className="p-1 relative flex gap-2 text-sm items-center">
      <div
        style={{
          backgroundColor: generateRandomColor(notficiationData.username),
        }}
        className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10"
      >
        {getInitials(notficiationData.username)}
      </div>
      <p className="flex-1">{notficiationData.content}</p>
      <p className="text-xs">{notficiationData.timestamp}</p>
    </div>
  );
};
