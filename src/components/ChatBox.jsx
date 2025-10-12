import React, { useEffect } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import Message from './Message';

const ChatBox = () => {
  const {selectedChat, theme} = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(selectedChat){
      // fetch messages
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])
  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:m-30 max-md:mt-14 2xl:pr-40'>
      {/* Chat Messages */}
      <div className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="" className='w-full max-w-56 sm:max-w-68'/>
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>Ask Me Anything</p>
          </div>
        )}
        {messages.map((message, index)=> <Message key={index} message={message}/> )}
        {/* Loading State */}
        {loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>}
      </div>
      {/* Prompt input box */}
      <form>

      </form>
    </div>
  )
}

export default ChatBox;