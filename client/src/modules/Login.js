import { useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useConfig } from "../contexts/ConfigContext";

const Login = ({ sendInfoMessage, setLoggedIn }) => {
  const timeoutRef = useRef(null)
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const { setAuth } = useSocket();
  const config = useConfig();

  const responses = new Map([
    ["missing.username.password", ["Username or password field is missing.", "failure"]],
    ["empty.username.password", ["Username and password cannot be empty.", "failure"]],
    ["invalid.username.password.format", ["Invalid username or password format.", "failure"]],
    ["user.does.not.exist", ["User does not exist.", "failure"]],
    ["server.error", ["", "Server error."]],
    ["incorrect.password", ["Incorrect password.", "failure"]],
  ]);

  const handleConnect = async (e) => {
    e.preventDefault();

    if (usernameInput.trim() !== "" && passwordInput.trim() !== "") {

      await fetch(`${config.apiUri}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      })
        .then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            const responseMessage = responses.get(data.message) || ["An unknown error occurred. Please try again.", "failure"];
            sendInfoMessage(responseMessage[0], responseMessage[1]);
          } else {
            if(!data.success){
              const [message, messageType] = responses.get(data.message) || ["An unknown error occurred. Please try again.", "failure"];
              return sendInfoMessage(message, messageType);
            }
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            sendInfoMessage("Login successful. Redirecting...", "success");

            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              setAuth({
                username: data.username,
                accessToken: data.accessToken
              })
              setLoggedIn(true)
            }, 2000)
          }
        })
        .catch((err) => {
          sendInfoMessage("An error occurred. Please try again.", "failure");
        });
    } else {
      sendInfoMessage("Please enter your username and password.", "warning");
    }
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleConnect}>
      <h1 className="text-lg text-center">Login</h1>
      <input
        maxLength={15}
        value={usernameInput}
        onChange={(e) => {
          setUsernameInput(e.target.value);
        }}
        className="flex grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
        placeholder="Username"
      />
      <input
        maxLength={15}
        value={passwordInput}
        type="password"
        onChange={(e) => {
          setPasswordInput(e.target.value);
        }}
        className="flex border-none grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
        placeholder="Password"
      />
      <button
        onClick={handleConnect}
        className="bg-green-700 text-white p-2 rounded-md hover:bg-green-800 active:bg-green-900 focus:outline-0 focus:ring-4 focus:ring-green-800/50 transition-all"
      >
        Join
      </button>
    </form>
  );
};

export default Login;
