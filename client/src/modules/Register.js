import React, { useState } from "react";

const Register = ({ sendErrorMessage }) => {
  const [emailInput, setEmailInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const responses = new Map([
    ["missing.username.email.password", ["Username, email, or password field is missing.", "failure"]],
    ["empty.username.email.password", ["Username, email, or password cannot be empty.", "failure"]],
    ["invalid.email.username.format", ["Invalid email or username format.", "failure"]],
    ["user.exists", ["A user with the email or username already exists.", "failure"]],
    ["reg.successful", ["Registration successful.", "success"]],
    ["err.occurred", ["An error occurred.", "failure"]],
  ]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (usernameInput !== "" && passwordInput !== "" && emailInput !== "") {
      try {
        const response = await fetch("http://10.15.2.200:81/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: usernameInput, password: passwordInput, email: emailInput }),
        });

        const data = await response.json();

        if (!response.ok) {
          switch (response.status) {
            case 400:
            case 500:
              sendErrorMessage(responses.get(data.message)[0], responses.get(data.message)[1]);
              break;
            default:
              sendErrorMessage("An unknown error occurred. Please try again.", "failure");
              break;
          }
        } else {
          sendErrorMessage(responses.get(data.message)[0], responses.get(data.message)[1]);
        }
      } catch (err) {
        sendErrorMessage("An error occurred. Please try again.", "failure");
      }
    } else {
      sendErrorMessage("Please enter your username and password.", "warning");
    }
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleRegister}>
      <h1 className="text-lg text-center">Register</h1>
      <input
        maxLength={30}
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        className="flex grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
        placeholder="E-mail"
      />
      <input
        maxLength={15}
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
        className="flex grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
        placeholder="Username"
      />
      <input
        maxLength={15}
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
        className="flex grow p-2 rounded-md z-[1] bg-rtca-300 dark:placeholder:text-rtca-300/75 placeholder:text-rtca-700 dark:bg-rtca-800 focus:ring-4 dark:focus:ring-rtca-500/50 focus:ring-rtca-400/50 focus:outline-0 transition-all"
        placeholder="Password"
      />
      <button
        type="submit"
        className="bg-green-700 text-white p-2 rounded-md hover:bg-green-800 active:bg-green-900 focus:outline-0 focus:ring-4 focus:ring-green-800/50 transition-all"
      >
        Join
      </button>
    </form>
  );
};

export default Register;
