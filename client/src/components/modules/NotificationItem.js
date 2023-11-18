import React from 'react'
import { generateRandomColor } from "../../helpers/generateRandomColor";
import { getInitials } from "../../helpers/getInitials";

export const NotificationItem = ({notficiationData}) => {
  return (
    <div className="p-1 relative flex gap-2 text-sm">
    <div className="absolute right-3 select-none text-xs">{notficiationData.timestamp}</div>
    <div
      style={{
        backgroundColor: generateRandomColor(notficiationData.username),
      }}
      className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10"
    >
      {getInitials(notficiationData.username)}
    </div>
    <div className="grid">
      <p>{notficiationData.title}</p>
      <p>{notficiationData.content}</p>
    </div>
  </div>
  )
}
