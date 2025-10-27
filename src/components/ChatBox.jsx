import React, { useEffect, useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import Message from './Message';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const containerRef = useRef(null);
  const { selectedChat, theme, user, setUser, token } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('text');
  const [isPublished, setIsPublished] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const promptCopy = prompt;
    setPrompt('');
    setLoading(true);

    // Add user's message to UI
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false },
    ]);

    try {
      // ✅ Use backend port (5000)
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/message/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished,
        }),
      });
      console.log("Requested URL :-",`${import.meta.env.VITE_BACKEND_URL}/api/message/${mode}`)
      if (!response.ok) {
        let errMsg = 'Something went wrong';
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch {
          // If backend sends no JSON (like a 404), show plain message
        }
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      // ✅ Handle streaming response (chunked text)
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isImage: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const startTime = Date.now();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk.trim()) continue;

        // Append text progressively
        aiMessage.content += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...aiMessage };
          return updated;
        });
      }

      const endTime = Date.now();
      const responseTime = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️ Response time: ${responseTime}s`);

      // ✅ Deduct credits
      setUser((prev) => ({
        ...prev,
        credits: prev.credits - (mode === 'image' ? 2 : 1),
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error:', error.message);
      toast.error('Failed to fetch AI response.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:m-30 max-md:mt-14 2xl:pr-40">
      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask Me Anything
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {mode === 'image' && (
        <label className="inline-flex items-center gap-2 mx-auto mb-3 text-sm">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30
        rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none"
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          <option className="dark:bg-purple-900" value="image">
            Image
          </option>
        </select>
        <input
          type="text"
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Type your prompt here...."
          className="flex-1 w-full text-sm outline-none"
          required
        />
        <button>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
