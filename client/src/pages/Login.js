import { useRef, useState, useEffect } from "react";
import { useConfig } from "../contexts/ConfigContext";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setRefreshToken } from '../redux/reducers/authSlicer';

export const Login = ({ sendInfoMessage }) => {
  const dispatch = useDispatch();
  const { authLoading, isLoggedIn } = useSelector(state => state.auth)
  const { translation } = useSelector(state => state.translation)
  const navigate = useNavigate();

  const timeoutRef = useRef(null)
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const config = useConfig();

  useEffect(() => {
    if (!authLoading) {
      if (isLoggedIn) {
        window.history.pushState(null, '', '/landing/signin');
        navigate("/")
      }
    }
  }, [navigate, authLoading, isLoggedIn]);

  useEffect(() => {
    document.title = `${translation.content.landing.signin.signin} - ${translation.content.title}`;
    return () => {
      document.title = `${translation.content.title}`;
    };
  }, [translation.content.landing.signin.signin, translation.content.title]);

  const handleLogin = async (e) => {
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
            const infoData =  translation.content.landing.signin.responseChart[data.message] || `${translation.content.common.error}|failure`;
            sendInfoMessage(infoData);
          } else {
            if (!data.success) {
              const infoData =  translation.content.landing.signin.responseChart[data.message] || `${translation.content.common.error}|failure`;
              return sendInfoMessage(infoData);
            }
            sendInfoMessage(translation.content.landing.signin.responseChart["success"]);

            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              dispatch(setAccessToken(data.accessToken))
              dispatch(setRefreshToken(data.refreshToken))
              window.history.pushState(null, '', '/landing/signin');
              navigate("/", { replace: true })
            }, 2000)
          }
        })
        .catch((err) => {
          if(process.env.NODE_ENV === 'development') console.error(`Something went wrong in /src/pages/Login.js. ${err.message}`);
          sendInfoMessage(`${translation.content.common.error}|failure`);
        });
    } else {
      sendInfoMessage(`${translation.content.common.error}|failure`);
    }
  };

  return (
    <div className="sm:hero-content mt-6 sm:mt-0 flex-col lg:flex-row-reverse">
      <div className="text-center lg:text-left">
        <h1 className="text-5xl font-bold">Sign in to Zypher!</h1>
        <p className="py-6">This is a great chance to discover new people and maybe make some nice friendships.</p>
      </div>
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body p-4 sm:p-8" onSubmit={handleLogin}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input onChange={(e) => setUsernameInput(e.target.value)} value={usernameInput} type="text" minLength={6} maxLength={12} placeholder="Username" className="input input-bordered" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input onChange={(e) => setPasswordInput(e.target.value)} value={passwordInput} type="password" placeholder="Password" className="input input-bordered" required />
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-primary">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/*
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
*/