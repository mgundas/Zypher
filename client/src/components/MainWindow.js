import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { generateRandomColor } from "../helpers/generateRandomColor";
import { getInitials } from "../helpers/getInitials";
import { useLanguage } from "../contexts/LanguageContext";

export const MainWindow = ({ handleActiveChat }) => {
  const { socket } = useSocket();
  const { langData, setLanguage, availableLangs } = useLanguage();

  const [randomUsers, setRandomUsers] = useState([]);
  const [langList, setLangList] = useState([])
  const { userData } = useAuth();

  let langSet = new Set;

  useEffect(() => {
    for(let i = 0; i < availableLangs.size; i++){
      langSet.add(availableLangs.get(i))
    }
    console.log(langSet);
    langSet.forEach(singleLang => {
      setLangList(prevList => [...prevList, singleLang])
    })
  }, [availableLangs])


  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      {langList.map((lang, index) => {
        return (
          <button onClick={() => {setLanguage(lang[0])}} className="btn btn-outline btn-accent" key={index}>{lang[1]}</button>
        )
      })}
      <button
        onClick={() => {
          socket.emit("randomUsers", 10, (data) => {
            setRandomUsers(data);
            console.log(data);
          });
        }}
        className="btn btn-outline btn-accent"
      >
        {langData.content.mainWindow.randomize}
      </button>
      <div className="p-2 flex gap-2">
        {randomUsers.map((user, index) => {
          if (user.username === userData.username) return;
          return (
            <button
              key={index}
              className="relative tooltip tooltip-bottom"
              data-tip={user.username}
            >
              <span className="h-3 w-3 rounded-full bg-green-600 absolute -top-0.5 -right-0.5 z-[1]"></span>
              <div
                onClick={() => handleActiveChat(user._id)}
                style={{
                  backgroundColor: generateRandomColor(user.username),
                }}
                className="mask mask-squircle select-none flex items-center justify-center font-medium h-10 w-10 text-white relative"
              >
                {getInitials(user.username)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
