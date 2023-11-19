import { useRef, useEffect, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { useConfig } from "../contexts/ConfigContext";
import { useAuth } from "../contexts/AuthContext";

export const LoginScreen = () => {
  const config = useConfig();
  const { loggedIn, userData } = useAuth();

  const infoBoxRef = useRef(null);
  const infoTimeoutRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");

  const sendInfoMessage = (message, type) => {
    const types = {
      success: "alert-success",
      failure: "alert-error",
      warning: "alert-warning",
      info: "alert-info",
    };

    infoBoxRef.current.className = `alert !w-auto justify-self-center ${types[type]}`;
    setErrorMsg(message);
    infoBoxRef.current.classList.remove("hidden");

    clearTimeout(infoTimeoutRef.current);
    infoTimeoutRef.current = setTimeout(() => {
      infoBoxRef.current.classList.add("hidden");
    }, 2000);
  };

  return (
    <div className="dark:text-white grid gap-5 mb-10 mt-10 md:mt-20 items-center">
      <h1 className="row-span-2 text-2xl text-center font-medium">
        {config.appName}
      </h1>
      {config.notice.visible ? (
        <div className="justify-self-center border-l-4 mx-5 md:mx-0 flex-wrap gap-1 border-teal-900 dark:border-teal-600 text-white dark:text-rtca-50 p-3 transition-all rounded-md bg-teal-700 dark:bg-teal-900 flex">
          <h1 className="font-medium">{config.notice.title}</h1>
          <h2>{config.notice.message}</h2>
        </div>
      ) : (
        <></>
      )}
      <div ref={infoBoxRef} className="hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{errorMsg}</span>
      </div>
      <div className="row-span-1 flex flex-row flex-wrap gap-10 items-center justify-center">
        <Login sendInfoMessage={sendInfoMessage} />
        <div className="hidden sm:flex">or</div>
        <Register sendInfoMessage={sendInfoMessage} />
      </div>
    </div>
  );
};
