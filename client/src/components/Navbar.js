import React from "react";
import { SenderList } from "./SenderList";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { getInitials } from "../helpers/getInitials";
import { useConfig } from "../contexts/ConfigContext";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useRecipient } from "../contexts/RecipientContext";
import ToggleDarkMode from "./ToggleDarkMode";
import { NotificationItem } from "./modules/NotificationItem";
import { RecipientProfile } from "./RecipientProfile";

export const Navbar = ({
  messages,
  handleActiveChat,
  status,
}) => {
  const { socket } = useSocket();
  const config = useConfig();
  const { userData } = useAuth();
  const { recipientData, activeChat, setActiveChat } = useRecipient();


  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="flex items-center">
          <SenderList
            setActiveChat={setActiveChat}
            messages={messages}
            handleActiveChat={handleActiveChat}
          />
          {activeChat ? (
            <div className="p-4 px-2 flex gap-3 items-center">
              <div
                style={{
                  backgroundColor: generateRandomColor(recipientData.username),
                }}
                className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10 "
              >
                {getInitials(recipientData.username)}
              </div>
              <div className="flex flex-col text-sm items-start">
                <button onClick={() => document.getElementById("recipientProfile").showModal()} className="font-medium">{recipientData.username}</button>
                <span className="text-rtca-400 select-none">{status}</span>
              </div>
              <RecipientProfile />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="navbar-center hidden sm:block">
        <button
          onClick={() => setActiveChat("")}
          className="btn btn-ghost text-xl"
        >
          {config.appName}
        </button>
      </div>
      <div className="navbar-end gap-2">
        <ToggleDarkMode />
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <div
            tabIndex={0}
            className="dropdown-content z-[1] card card-compact w-72 p-2 shadow bg-rtca-800 rounded-t-none"
          >
            <div className="p-1 grid gap-">
              <h3 className="text-center text-lg font-medium">Notifications</h3>
              <div className="overflow-y-auto overflow-x-hidden grid gap-1 max-h-[calc(100vh/2)]">
                <NotificationItem
                  notficiationData={{
                    username: userData.username,
                    title: "New follower!",
                    content: "@mitchgrassi started to follow you.",
                    timestamp: "10w",
                  }}
                />
                <NotificationItem
                  notficiationData={{
                    username: "dongalamasyon",
                    title: "New follower!",
                    content: "@dongalamasyon started to follow you.",
                    timestamp: "10w",
                  }}
                />
                <NotificationItem
                  notficiationData={{
                    username: "s2mdimdick",
                    title: "New follower!",
                    content: "@s2mdimdick started to follow you.",
                    timestamp: "10w",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            style={{
              backgroundColor: generateRandomColor(userData.username),
            }}
            className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10 "
          >
            {getInitials(userData.username)}
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-rtca-800 rounded-box rounded-t-none w-52"
          >
            <li>
              <button className="justify-between">
                Profile
                <span className="badge bg-rtca-700 border-none">New</span>
              </button>
            </li>
            <li>
              <button>Settings</button>
            </li>
            <li>
              <button>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
