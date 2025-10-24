import React, { useEffect, useRef } from 'react'
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import Message from './Message';
import Credits from '../pages/Credits';
import { data } from 'react-router-dom';

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat, theme, user, setUser, axios, token} = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e)=>{
    e.preventDefault();
    
    try{
      if(!user) return null;
      const promptCopy = prompt
      setPrompt('')
      // ✅ Show loader before calling API
    setLoading(true);
      setMessages(prev => [...prev, {role: "user", content : prompt, timestamp:Date.now(), isImage:false}])

      const response = await axios.post(`/api/message/${mode}`,{chatId : selectedChat._id, prompt,isPublished},
        {headers : {Authorization :`Bearer ${token}`}}
      )
      if(response.status === 200){
        setMessages(prev => [...prev,response.data.reply])
        //decrease credits
        if(mode === 'image'){
          setUser(prev => ({...prev, credits : prev.credits -2}))
        }
        else{
          setUser(prev => ({...prev, credits : prev.credits -1}))
        }
      }else{
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    }
    catch(error){
      console.log("Error while generating a image")
      toast.error(error.message)
    }
    finally {
      setPrompt('')
      setLoading(false)
    }
  }

  useEffect(() => {
    if(selectedChat){
      // fetch messages
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior : 'smooth',
      })
    }
  },[messages])
  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:m-30 max-md:mt-14 2xl:pr-40'>
      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
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

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mx-auto mb-3 text-sm'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)}/>
        </label>
      )}
      {/* Prompt input box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30
      rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
          <select onChange={(e)=>setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
            <option className="dark:bg-purple-900" value="text">Text</option>
            <option className="dark:bg-purple-900" value="image">Image</option>
          </select>
          <input type='text' onChange={(e)=>setPrompt(e.target.value)} value={prompt}
          placeholder='Type your prompt here....' className='flex-1 w-full text-sm outline-none' required/>
          <button>
            <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
          </button>
      </form>
    </div>
  )
}

export default ChatBox;