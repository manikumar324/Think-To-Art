import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";



const Sidebar = () => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    setToken,
    axios,
    token,
    setChats,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile toggle

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

const deleteChat = async (e, chatId) => {
  try {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;

    const response = await axios.delete(`/api/chat/delete/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));
      toast.success("Chat deleted successfully!"); // ✅ Toast here
    }
  } catch (error) {
    console.log("Error deleting Chat:", error.message);
    toast.error("Failed to delete chat. Please try again."); // ❌ Toast on error
  }
};


  return (
    <>
      {/* 3-bar menu icon - mobile only, only render here */}
      <img
        onClick={() => setIsMenuOpen(true)}
        src={assets.menu_icon}
        alt="menu"
        className="fixed top-4 left-4 w-7 h-7 cursor-pointer md:hidden z-50 not-dark:invert"
      />

      <div
        className={`flex flex-col h-screen min-w-72 p-5 
          dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30
          border-r border-[#80609F]/30 backdrop-blur-3xl bg-white dark:bg-[#0b0016]
          transition-transform duration-500 max-md:fixed left-0 top-0 z-50
          ${!isMenuOpen ? "max-md:-translate-x-full" : "max-md:translate-x-0"}`}
      >
        {/* Close Icon for Mobile */}
        <img
          onClick={() => setIsMenuOpen(false)}
          src={assets.close_icon}
          alt="close"
          className="absolute top-4 right-4 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
        />

        {/* Logo */}
        <img
          src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
          className="w-full max-w-48"
          alt=""
        />

        {/* New Chat Button */}
        <button
          onClick={() => {
            createNewChat(); // Only call context function; it already triggers toast
            setIsMenuOpen(false); // close sidebar on mobile
          }}
          className="flex items-center justify-center w-full py-3 mt-10 text-white 
          bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer"
        >
         <MessageCircle className="w-5 h-5 mr-2" />  {/* Lucide icon */}
          New Chat
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
          <img src={assets.search_icon} alt="" className="w-4 not-dark:invert" />
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Search Conversations..."
            className="text-xs placeholder:text-gray-400 outline-none bg-transparent"
          />
        </div>

        {/* Recent Chats */}
        {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

<div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
  {chats
    .filter((chat) =>
      chat.messages[0]
        ? chat.messages[0].content.toLowerCase().includes(search.toLowerCase())
        : chat.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((chat) => {
      // Determine the display text
      const displayText =
        chat.messages.length > 0
          ? chat.messages[0].content.length > 25
            ? chat.messages[0].content.slice(0, 25) + "..."
            : chat.messages[0].content
          : chat.name.length > 25
          ? chat.name.slice(0, 25) + "..."
          : chat.name;

      return (
        <div
          key={chat._id}
          onClick={() => {
            navigate("/");
            setSelectedChat(chat);
            setIsMenuOpen(false);
          }}
          className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between items-start group"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium w-full" title={chat.messages.length > 0 ? chat.messages[0].content : chat.name}>
              {displayText}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
              {moment(chat.updatedAt).fromNow()}
            </p>
          </div>

          <img
            onClick={(e) => deleteChat(e, chat._id)}
            src={assets.bin_icon}
            alt="Delete Chat"
            className="ml-2 w-4 cursor-pointer mt-2 group-hover:block not-dark:invert"
          />
        </div>
      );
    })}
</div>


        {/* Community */}
        <div
          onClick={() => {
            navigate("/community");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
        >
          <img src={assets.gallery_icon} alt="" className="w-4.5 not-dark:invert" />
          <p className="text-sm">Community Images</p>
        </div>

        {/* Credits */}
        <div
          onClick={() => {
            navigate("/credits");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all"
        >
          <img src={assets.diamond_icon} alt="" className="w-4.5 dark:invert" />
          <div className="flex flex-col text-sm">
            <p>Credits : {user?.credits}</p>
            <p className="text-sm text-gray-400">
              Purchase credits to use QuickGPT
            </p>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md ">
          <div className="flex items-center gap-2 text-sm">
            <img src={assets.theme_icon} alt="" className="w-4 not-dark:invert" />
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex cursor-pointer">
            <input
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
            />
            <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
          </label>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group">
          {/* <img src={assets.user_icon} alt="" className="w-7 rounded-full" /> */}
          <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
    {user ? user.name.charAt(0).toUpperCase() : "U"}
  </div>
          <p className="flex-1 text-sm dark:text-primary truncate">{user ? user.name : "Login your account"}</p>
          {user && (
            <img
              onClick={logout}
              src={assets.logout_icon}
              alt=""
              className="h-5 cursor-pointer not-dark:invert group-hover:block"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
