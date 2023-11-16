import React from "react";
import { getInitials } from "../helpers/getInitials";

export const SenderList = ({ handleActiveChat, uniqueSenders }) => {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      {/* Page content here */}
      <label
        htmlFor="my-drawer"
        className="rounded-full flex items-center justify-center h-10 w-10 hover:bg-rtca-600/50 transition-all"
      >
        <i className="bi bi-list"></i>
      </label>
      <div className="drawer-side z-10">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="w-80 flex flex-col min-h-full bg-rtca-900">
          <div className="p-5 font-medium text-center">Conversations</div>
          <div className="flex flex-1 flex-col">
            {uniqueSenders.map((sender, index) => (
              <button
                onClick={() => {
                  handleActiveChat(sender);
                }}
                key={index}
                className="p-4 flex gap-2 items-center hover:bg-rtca-500/50 transition-all"
              >
                <div className="bg-purple-600 p-2 rounded-full select-none text-center font-medium h-10 w-10">
                  {getInitials(sender)}
                </div>
                <div className="grid grid-rows-2 text-sm">
                  <div className="font-medium text-left">{sender}</div>
                  <span className="">{}</span>
                </div>
              </button>
            ))}
          </div>
          <button
            className="p-4 bg-green-800 hover:bg-green-500/50 transition-all"
            onClick={() => document.getElementById("my_modal_1").showModal()}
          >
            New conversation
          </button>
        </div>
      </div>
    </div>
  );
};
