import React, { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBox = () => {
  const containerRef = useRef(null);
  const { selectedChat, theme, user, setUser, token } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) setMessages(selectedChat.messages || []);
  }, [selectedChat]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const promptCopy = prompt.trim();
    if (!promptCopy) return;

    setPrompt("");
    setLoading(true);

    // User message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: promptCopy, timestamp: Date.now(), isImage: false },
    ]);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/message/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      // 🖼️ Image Mode
      if (mode === "image") {
        const data = await res.json();
        if (data.imageUrl) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.imageUrl,
              isImage: true,
              timestamp: Date.now(),
            },
          ]);
          setUser((prev) => ({ ...prev, credits: prev.credits - 2 }));
        } else {
          toast.error("Image generation failed.");
        }
        setLoading(false);
        return;
      }

      // 💬 Text Mode (Streaming)
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMsg = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isImage: false,
      };

      // Add empty assistant message to begin progressive rendering
      setMessages((prev) => [...prev, { ...assistantMsg }]);

      let buffer = "";
      const FLUSH_THRESHOLD = 40;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        // Clean & normalize chunk
        chunk = chunk
          .replace(/^data:\s*/g, "")
          .replace(/\n\n$/g, "")
          .trim()
          .replace(/\\n/g, "\n");

        buffer += chunk;

        const endsWithPunct = /[.!?\n]$/.test(buffer);
        if (buffer.length > FLUSH_THRESHOLD || endsWithPunct) {
          assistantMsg.content += buffer;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMsg };
            return updated;
          });

          buffer = "";
        }
      }

      // Final flush
      if (buffer.length > 0) {
        assistantMsg.content += buffer;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg };
          return updated;
        });
      }

      setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
      setLoading(false);
    } catch (err) {
      console.error("Streaming error:", err);
      toast.error("Failed to fetch AI response.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:m-30 max-md:mt-14 2xl:pr-40">
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-auto">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask Me Anything
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} message={m} />
        ))}

        {loading && (
          <div className="loader flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce delay-150"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce delay-300"></div>
          </div>
        )}
      </div>

      {mode === "image" && (
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

      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>

        <input
          type="text"
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none bg-transparent"
          required
        />

        <button type="submit">
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt="Send"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
