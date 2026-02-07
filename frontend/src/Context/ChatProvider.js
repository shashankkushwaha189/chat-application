import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();
const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [notification, setNotification] = useState([]);
  const history = useHistory();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let userInfo;
    try {
      userInfo = JSON.parse(localStorage.getItem("userInfo"));
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage", error);
      userInfo = null;
    }
    setUser(userInfo);
    if (!userInfo) {
      history.push("/");
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
