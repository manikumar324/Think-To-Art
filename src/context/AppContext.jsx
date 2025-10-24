import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
console.log("Backend URl :-",import.meta.env.VITE_SERVER_URL)

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [defaultChatCreated, setDefaultChatCreated] = useState(false);

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/user/userdetails", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const userData = response.data;
        setUser(userData); // <-- state update
      }
    } catch (error) {
      toast.error("Unable to fetch user details");
      console.error(error.response?.data || error.message);
      setLoadingUser(false);
    }
  };

  // Fetch chats
  const fetchUserChats = async (currentUser) => {
    if (!currentUser) return;

    try {
      const response = await axios.get("/api/chat/getAllChats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        let allChats = response.data.chats || [];

        // If no chats, create default chat
        if (allChats.length === 0 && !defaultChatCreated) {
          setDefaultChatCreated(true);
          const newChat = await createNewChat(true); // auto-create
          allChats = newChat ? [newChat] : [];
        }

        setChats(allChats);
        setSelectedChat(allChats[0] || null);
        console.log("Chats after fetch:", allChats);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  // Create a new chat
  const createNewChat = async (auto = false) => {
    try {
      if (!user) return;

      if (!auto) navigate("/");

      const response = await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        const newChat = response.data.newChat;
        if (newChat) {
          // Update chats state immediately
          setChats((prev) => [newChat,...prev]);
          setSelectedChat(newChat);
          toast.success("New Chat Created")
        }

        if (!auto) toast.success("New chat created successfully!");
        return newChat;
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Run when token changes
  useEffect(() => {
    if (token) {
      fetchUser(); // fetch user first
    } else {
      setUser(null);
      setChats([]);
      setSelectedChat(null);
      setLoadingUser(false);
    }
  }, [token]);

  // Run when user changes
  useEffect(() => {
    if (user) {
      fetchUserChats(user); // fetch chats only after user is set
    }
  }, [user]);

  // Theme effect
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
