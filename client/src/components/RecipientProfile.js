import React from "react";
import { useRecipient } from "../contexts/RecipientContext";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { getInitials } from "../helpers/getInitials";

export const RecipientProfile = () => {
  const { recipientData } = useRecipient();

  const convertTime = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  };

  return (
    <dialog id="recipientProfile" className="modal modal-top sm:modal-middle">
      <div className="modal-box bg-rtca-800">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div className="flex gap-3">
          <div
            style={{
              backgroundColor: generateRandomColor(recipientData.username),
            }}
            className="p-2 mask mask-squircle select-none flex items-center justify-center text-4xl font-medium h-20 w-20 "
          >
            {getInitials(recipientData.username)}
          </div>
          <div className="flex flex-col grow px-2 justify-center">
            <p className="font-medium">{recipientData.username}</p>
            <p className="font-medium">
              Joined on: {convertTime(recipientData.createdAt)}
            </p>
            <p className="font-medium">User id: {recipientData.id}</p>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
