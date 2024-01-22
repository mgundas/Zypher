import { useEffect, useRef, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { useConfig } from "../../contexts/ConfigContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const LoginScreen = () => {
  const config = useConfig();
  const {loggedIn} = useAuth();
  const navigate = useNavigate();

  const infoBoxRef = useRef(null);
  const infoTimeoutRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if(loggedIn){
      console.log("bro ur logged in");
      navigate("/", {replace: true})
    }
  }, [loggedIn, navigate])

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
    <div className="dark:text-white grid gap-5 pt-10 md:pt-20 items-center">
      <h1 className="row-span-2 text-2xl text-center font-medium">
        {config.appName}
      </h1>
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
