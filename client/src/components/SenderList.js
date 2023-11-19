import React, { useState, useEffect } from "react";
import { getInitials } from "../helpers/getInitials";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { useAuth } from "../contexts/AuthContext";

export const SenderList = ({
  handleActiveChat,
  setActiveChat,
  messages
}) => {
  const { userData } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [uniqueSenders, setUniqueSenders] = useState([]);

  useEffect(() => {
    const senders = [
      ...new Set(
        messages.map((message) => {
          if (message.sender !== userData.username) {
            return message.sender;
          } else {
            return message.recipient;
          }
        })
      ),
    ];
    setUniqueSenders(senders);
  }, [messages, userData.username]);

  return (
    <>
      <div className="drawer">
        <input
          id="senderListDrawer"
          type="checkbox"
          className="drawer-toggle"
        />
        {/* Page content here */}
        <label
          htmlFor="senderListDrawer"
          className="rounded-full flex items-center justify-center h-10 w-10 hover:bg-rtca-600/50 transition-all"
        >
          <i className="bi bi-list"></i>
        </label>
        <div className="drawer-side z-10">
          <label
            htmlFor="senderListDrawer"
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
                    document.getElementById("senderListDrawer").checked = false;
                  }}
                  key={index}
                  className="p-4 flex gap-2 items-center hover:bg-rtca-500/50 transition-all"
                >
                  <div
                    style={{
                      backgroundColor: generateRandomColor(sender),
                    }}
                    className="p-2 mask mask-squircle select-none text-center font-medium h-10 w-10"
                  >
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
              onClick={() =>
                document.getElementById("newConvoModal").showModal()
              }
            >
              New conversation
            </button>
          </div>
        </div>
      </div>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="newConvoModal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-rtca-800">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Start a new conversation.</h3>
          <div className="py-2 flex">
            <form
              method="dialog"
              className="flex gap-2 p-4 grow items-center justify-center"
              onSubmit={(e) => {
                setActiveChat(searchInput);
                document.getElementById("senderListDrawer").checked = false;
              }}
            >
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="convo-modal-content-input grow"
                placeholder="Search for a user."
                maxLength={12}
              />
              <button className="chat-send-button">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
