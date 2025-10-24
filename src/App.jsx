import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Community from "./pages/Community";
import Credits from "./pages/Credits";
import { assets } from "./assets/assets";
import "./assets/prism.css";
import Loading from "./pages/Loading";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, loadingUser } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname === "/loading" || loadingUser) return <Loading />;

  return (
    <>
      <Toaster />

      {user ? (
        <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
          {/* 3-bar icon only visible if user is logged in and sidebar is closed */}
          {/* {!isMenuOpen && (
            <img
              src={assets.menu_icon}
              alt="menu"
              className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert z-50"
              onClick={() => setIsMenuOpen(true)}
            />
          )} */}

          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<ChatBox />} />
              <Route path="/community" element={<Community />} />
              <Route path="/credits" element={<Credits />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#531B81] to-[#29184B] flex items-center justify-center h-screen w-screen">
          {/* No 3-bar icon on login */}
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
