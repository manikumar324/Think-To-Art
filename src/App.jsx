import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Routes, Route,useLocation } from "react-router-dom";
import ChatBox from "./components/ChatBox";
import Community from "./pages/Community";
import Credits from "./pages/Credits";
import { assets } from "./assets/assets";
import './assets/prism.css';
import Loading from "./pages/Loading";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {pathname} = useLocation();

  if(pathname === '/loading') return <Loading />
  return (
    <>
    {!isMenuOpen && <img src={assets.menu_icon} alt="" className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert"
    onClick={()=>setIsMenuOpen(true)}/>} 
      <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
        <div className="flex h-screen w-screen">
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/community" element={<Community />} />
            <Route path="/credits" element={<Credits />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
