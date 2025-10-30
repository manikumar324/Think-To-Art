import React, { useEffect, useRef } from "react";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

/**
 * Message component
 * - Compact spacing for user messages
 * - Progressive Markdown rendering for assistant messages
 * - Code highlighting (Prism)
 * - Handles both text and images
 */
const Message = ({ message }) => {
  const { user } = useAppContext();
  const isUser = message.role === "user";
  const markdownRef = useRef(null);
   const [renderedText, setRenderedText] = useState("");

    // ✅ Update rendered text gradually for streaming Markdown
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderedText(message.content);
    }, 50); // updates every 100ms for smoother streaming

    return () => clearInterval(interval);
  }, [message.content]);

  // Highlight code when message content updates
  useEffect(() => {
    Prism.highlightAll();
  }, [renderedText]);

  return (
    <div
      className={`flex gap-2 py-2 ${
        isUser ? "justify-end items-start mb-2" : "justify-start items-start mb-3"
      }`}
    >
      {/* 🧠 AI Avatar (Left Side) */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0">
          AI
        </div>
      )}

      {/* 💬 Message Bubble */}
      <div
        className={`flex flex-col ${
          isUser ? "gap-0" : "gap-2"
        } rounded-lg max-w-2xl border shadow-sm transition-all duration-200 ${
          isUser
            ? "bg-slate-50 dark:bg-[#57317C]/30 border-[#80609F]/30 p-2 px-3"
            : "bg-primary/20 dark:bg-[#57317C]/30 border-[#80609F]/30 p-3 px-4"
        }`}
      >
        {/* 🖼️ Assistant Image */}
        {!isUser && message.isImage ? (
          <img
            src={message.content}
            alt="Generated"
            className="w-full max-w-md mt-1 rounded-md"
          />
        ) : (
          <div
            ref={markdownRef}
            className={`text-sm dark:text-primary ${
              isUser
                ? "prose-p:my-0 prose-pre:my-0"
                : "prose dark:prose-invert max-w-none leading-relaxed"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto my-1 text-sm">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {renderedText}
            </ReactMarkdown>
          </div>
        )}

        {/* 🕓 Timestamp */}
        <span
          className={`text-xs text-gray-400 dark:text-[#B1A6C0] self-end ${
            isUser ? "mt-0.5" : "mt-2"
          }`}
        >
          {moment(message.timestamp).fromNow()}
        </span>
      </div>

      {/* 👤 User Initial (Right Side) */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
          {user ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
};

export default Message;
