import { useState } from "react";
import { useSocket } from "../contexts/SocketContext";

const Login = ({ sendErrorMessage }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const { socket, setAuth } = useSocket();

  const handleConnect = async (e) => {
    e.preventDefault();
    if (usernameInput !== "" && passwordInput !== "") {
      const username = usernameInput;

      // Simulate user registration by making a POST request to your server
      await fetch("http://10.15.2.200:81/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: passwordInput }),
      })
        .then(async (response) => {
          const data = await response.json();
          const statusCode = response.status;

          if (!response.ok) {
            switch (statusCode) {
              case 400:
                sendErrorMessage(data.message);
                break;
              case 500:
                sendErrorMessage(data.message);
                break;
              default:
                sendErrorMessage("An unknown error occured.");
                break;
            }
          } else {
          }
          console.log(data);
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    } else {
      sendErrorMessage("Please enter your username and password.");
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
        onChange={(e) => {
          setPasswordInput(e.target.value);
        }}
        className="flex grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
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
