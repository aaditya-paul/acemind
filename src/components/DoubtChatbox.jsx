"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Maximize2,
  Minimize2,
  Quote,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import {
  saveDoubtMessage,
  getDoubtMessages,
  deleteDoubtMessage,
  clearAllDoubtMessages,
} from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

const DoubtChatbox = forwardRef(
  (
    {
      currentSubtopicData,
      allSubtopicsData = [],
      selectedText = "",
      chatId,
      chatData,
    },
    ref
  ) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatboxRef = useRef(null);

    // Draggable functionality
    const { position, handleMouseDown } = useDraggable(chatboxRef, isMaximized);

    // Load messages from database on mount
    useEffect(() => {
      const loadMessages = async () => {
        if (!chatId || !user?.uid) {
          setLoadingMessages(false);
          return;
        }

        try {
          const result = await getDoubtMessages(chatId, user.uid);
          if (result.success) {
            setMessages(result.data || []);
          } else {
            console.error("Failed to load doubt messages:", result.message);
          }
        } catch (error) {
          console.error("Error loading doubt messages:", error);
        } finally {
          setLoadingMessages(false);
        }
      };

      loadMessages();
    }, [chatId, user?.uid]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      openWithText: (text) => {
        setIsOpen(true);
        setReplyingTo({
          type: "selectedText",
          content: text,
          timestamp: new Date(),
        });
        // Focus input after a short delay to ensure chatbox is open
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
      },
      clearSelectedText: () => {
        setReplyingTo(null);
      },
    }));

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    // Focus input when chatbox opens
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    // NOTE: Removed automatic selectedText handling
    // Selected text is now only set when "Ask Doubt" is clicked via openWithText()
    // This prevents the glitchy deselection behavior

    // Prepare context for AI
    const prepareContext = () => {
      let context = "";

      // Add current subtopic data as primary context
      if (currentSubtopicData?.aiResponse) {
        context += `# Current Topic: ${
          currentSubtopicData.aiResponse.title || "N/A"
        }\n\n`;

        if (currentSubtopicData.aiResponse.content) {
          currentSubtopicData.aiResponse.content.forEach((item) => {
            if (item.heading) {
              context += `## ${item.heading}\n`;
            }

            switch (item.type) {
              case "text":
                context += `${item.value}\n\n`;
                break;
              case "bullet":
                if (item.items) {
                  item.items.forEach((bulletItem) => {
                    context += `- ${bulletItem}\n`;
                  });
                  context += "\n";
                }
                break;
              case "code":
                context += `\`\`\`${item.language || ""}\n${
                  item.value
                }\n\`\`\`\n\n`;
                break;
              case "table":
                if (item.headers) {
                  context += `| ${item.headers.join(" | ")} |\n`;
                  context += `| ${item.headers
                    .map(() => "---")
                    .join(" | ")} |\n`;
                }
                if (item.rows) {
                  item.rows.forEach((row) => {
                    context += `| ${row.join(" | ")} |\n`;
                  });
                }
                context += "\n";
                break;
              case "practiceQuestions":
                if (item.items) {
                  item.items.forEach((q, idx) => {
                    context += `${idx + 1}. ${q}\n`;
                  });
                  context += "\n";
                }
                break;
            }
          });
        }
      }

      // Add other subtopics as additional context
      if (allSubtopicsData && allSubtopicsData.length > 0) {
        context += "\n# Related Topics Context:\n\n";
        allSubtopicsData.forEach((subtopic) => {
          if (
            subtopic?.aiResponse?.title &&
            subtopic.aiResponse.title !== currentSubtopicData?.aiResponse?.title
          ) {
            context += `## ${subtopic.aiResponse.title}\n`;
            // Add brief content summary
            if (
              subtopic.aiResponse.content &&
              subtopic.aiResponse.content.length > 0
            ) {
              const firstTextItem = subtopic.aiResponse.content.find(
                (item) => item.type === "text"
              );
              if (firstTextItem?.value) {
                context += `${firstTextItem.value.substring(0, 200)}...\n\n`;
              }
            }
          }
        });
      }

      // Add selected text as focused context if available
      if (selectedText) {
        context += `\n# User Selected Text (Primary Focus):\n${selectedText}\n\n`;
      }

      // If no specific subtopic context, use syllabus context from chat data
      if (
        !currentSubtopicData?.aiResponse &&
        allSubtopicsData.length === 0 &&
        chatData?.syllabusContext
      ) {
        context += `# Course Syllabus Context:\n${chatData.syllabusContext}\n\n`;
      }

      // If still no context, use course structure from aiResponse
      if (
        !context &&
        chatData?.aiResponse &&
        typeof chatData.aiResponse === "object"
      ) {
        const aiResponse = chatData.aiResponse;

        // Add course title
        if (aiResponse.courseTitle) {
          context += `# Course: ${aiResponse.courseTitle}\n\n`;
        }

        // Add course structure/units overview
        if (aiResponse.units && Array.isArray(aiResponse.units)) {
          context += `## Course Structure:\n\n`;
          aiResponse.units.forEach((unit, index) => {
            if (unit.unit_title) {
              context += `### Unit ${index + 1}: ${unit.unit_title}\n`;
              if (unit.sub_topics && Array.isArray(unit.sub_topics)) {
                unit.sub_topics.forEach((subtopic) => {
                  context += `- ${subtopic}\n`;
                });
              }
              context += "\n";
            }
          });
        }

        // Add syllabus context if available
        if (chatData.syllabusContext) {
          context += `## Original Syllabus:\n${chatData.syllabusContext}\n\n`;
        }
      }

      // If no context at all, provide a general learning context
      if (!context || context.trim() === "") {
        context =
          "# General Learning Context\nThe student is currently learning and may have general questions about their course material.\n";
      }

      return context;
    };

    // Send message to AI
    const handleSendMessage = async () => {
      if (!inputMessage.trim() || isLoading) return;

      const userMessage = {
        id: Date.now(),
        type: "user",
        content: inputMessage,
        timestamp: new Date().toISOString(),
        replyTo: replyingTo
          ? {
              type: replyingTo.type,
              content: replyingTo.content,
            }
          : null,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setReplyingTo(null); // Clear reply context after sending
      setIsLoading(true);

      // Clear selected text in parent component
      window.dispatchEvent(new CustomEvent("clearSelectedText"));

      // Save user message to database
      if (chatId && user?.uid) {
        await saveDoubtMessage(chatId, user.uid, userMessage);
      }

      try {
        // Prepare the context
        const context = prepareContext();

        // Call the API
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_ENDPOINT + "/api/doubt-chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: inputMessage,
              context: context,
              selectedText: selectedText || null,
              conversationHistory: messages
                .filter((msg) => msg.type !== "system")
                .slice(-5) // Last 5 messages for context
                .map((msg) => ({
                  role: msg.type === "user" ? "user" : "assistant",
                  content: msg.content,
                })),
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.answer) {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: data.answer,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);

          // Save AI message to database
          if (chatId && user?.uid) {
            await saveDoubtMessage(chatId, user.uid, aiMessage);
          }
        } else {
          throw new Error(data.message || "Failed to get response");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = {
          id: Date.now() + 1,
          type: "error",
          content: "Sorry, I couldn't process your question. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    // Delete a specific message
    const handleDeleteMessage = async (messageId) => {
      if (!chatId || !user?.uid) return;

      try {
        const result = await deleteDoubtMessage(chatId, user.uid, messageId);
        if (result.success) {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } else {
          console.error("Failed to delete message:", result.message);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    };

    // Clear all messages
    const handleClearChat = async () => {
      if (!chatId || !user?.uid) return;

      try {
        const result = await clearAllDoubtMessages(chatId, user.uid);
        if (result.success) {
          setMessages([]);
          setShowClearConfirm(false);
        } else {
          console.error("Failed to clear messages:", result.message);
        }
      } catch (error) {
        console.error("Error clearing messages:", error);
      }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    // Render message with markdown support
    const renderMessage = (message) => {
      const baseClasses = "px-4 py-2 rounded-lg max-w-[85%] break-words";

      switch (message.type) {
        case "user":
          return (
            <div className="flex justify-end items-start gap-2 group relative w-full">
              <button
                onClick={() => handleDeleteMessage(message.id)}
                className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-md transition-colors flex-shrink-0 mt-1"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="flex flex-col items-end max-w-[75%] min-w-[120px]">
                {/* Reply Preview for User Messages */}
                {message.replyTo && (
                  <div className="mb-1 bg-gray-800/40 border-l-2 border-yellow-400/60 rounded-r px-2 py-1 w-full">
                    <div className="flex items-start gap-1">
                      <Quote className="w-3 h-3 text-yellow-400/60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-yellow-400/80 mb-0.5">
                          {message.replyTo.type === "selectedText"
                            ? "Selected Text"
                            : "Replying to"}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-2 italic break-words">
                          "{message.replyTo.content.substring(0, 80)}
                          {message.replyTo.content.length > 80 ? "..." : ""}"
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* User Message Bubble */}
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 break-words w-fit max-w-full">
                  {message.content}
                </div>
              </div>
            </div>
          );

        case "ai":
          return (
            <div className="flex justify-start items-start gap-2 group relative w-full">
              <div className="px-4 py-2 rounded-lg bg-gray-800/90 text-gray-100 border border-gray-700/50 break-words max-w-[75%]">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-yellow-400">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-300">{children}</em>
                    ),
                    code: ({ children, inline }) =>
                      inline ? (
                        <code className="bg-gray-900 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-gray-900 text-yellow-300 p-2 rounded text-sm font-mono overflow-x-auto my-2">
                          {children}
                        </code>
                      ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 mb-2 marker:text-yellow-400">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 mb-2 marker:text-yellow-400">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-yellow-400 mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold text-yellow-400 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold text-yellow-400 mb-1">
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <button
                onClick={() => handleDeleteMessage(message.id)}
                className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-md transition-colors flex-shrink-0 mt-1"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          );

        case "system":
          return (
            <div className="flex justify-center">
              <div className="px-3 py-1.5 bg-gray-800/50 text-gray-400 text-xs rounded-full border border-gray-700/30">
                {message.content}
              </div>
            </div>
          );

        case "error":
          return (
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-red-900/30 text-red-300 text-sm rounded-lg border border-red-700/50">
                {message.content}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <>
        {/* Floating Action Button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 p-4 rounded-full shadow-2xl transition-all duration-300 group"
              aria-label="Open doubt chatbox"
            >
              <div className="flex gap-1">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">Doubts</span>
              </div>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                ?
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chatbox */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={chatboxRef}
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                width: isMaximized ? "100%" : "420px",
                height: isMaximized ? "100%" : "650px",
              }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed z-50 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden ${
                isMaximized ? "inset-0 rounded-none" : "rounded-xl"
              }`}
              style={
                isMaximized
                  ? { left: 0, top: 0 }
                  : {
                      left: position.x ? `${position.x}px` : "auto",
                      top: position.y ? `${position.y}px` : "auto",
                      right: position.x ? "auto" : "24px",
                      bottom: position.y ? "auto" : "24px",
                    }
              }
            >
              {/* Header - Draggable */}
              <div
                className="drag-handle flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-b border-gray-700/50 cursor-move"
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-900" />
                  <h3 className="text-gray-900 font-bold">Ask a Doubt</h3>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="p-1.5 hover:bg-gray-900/10 rounded transition-colors"
                      aria-label="Clear all messages"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4 text-gray-900" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 hover:bg-gray-900/10 rounded transition-colors"
                    aria-label={isMaximized ? "Minimize" : "Maximize"}
                  >
                    {isMaximized ? (
                      <Minimize2 className="w-4 h-4 text-gray-900" />
                    ) : (
                      <Maximize2 className="w-4 h-4 text-gray-900" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-900/10 rounded transition-colors"
                    aria-label="Close chatbox"
                  >
                    <X className="w-4 h-4 text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                      <p className="text-gray-400 text-sm">
                        Loading messages...
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-4">
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-full mb-4 border border-yellow-500/30">
                      <MessageCircle className="w-12 h-12 text-yellow-500" />
                    </div>
                    <p className="text-sm font-medium mb-1 text-gray-300">
                      Ask any doubt or question
                    </p>
                    <p className="text-xs mt-2 text-gray-400">
                      {currentSubtopicData
                        ? selectedText
                          ? "📌 I'll focus on your selected text from this topic"
                          : "💡 I have the current topic as context"
                        : selectedText
                        ? "📌 I'll focus on your selected text"
                        : chatData?.syllabusContext || chatData?.aiResponse
                        ? "📚 I have the course syllabus and structure as context"
                        : "🌐 Ask me anything - I'm here to help!"}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
                      💡 Tip: Select text for more focused answers
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderMessage(message)}
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="px-4 py-3 bg-gray-800/90 border border-gray-700/50 rounded-lg flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                          <span className="text-gray-300 text-sm">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 bg-gray-800/80 border-t border-gray-700/50 backdrop-blur-sm">
                {/* Reply Preview - WhatsApp Style */}
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 bg-gray-700/50 border-l-4 border-yellow-500 rounded-r-lg p-3 relative"
                  >
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        // Notify parent to clear selected text
                        if (ref && typeof ref === "object" && ref.current) {
                          // Clear in parent component
                          window.dispatchEvent(
                            new CustomEvent("clearSelectedText")
                          );
                        }
                      }}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-600/50 rounded-full transition-colors"
                      aria-label="Cancel reply"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                    <div className="flex items-start gap-2 pr-6">
                      <Quote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-yellow-400 mb-1">
                          {replyingTo.type === "selectedText"
                            ? "Selected Text"
                            : "Replying to"}
                        </div>
                        <div className="text-sm text-gray-300 line-clamp-3 italic">
                          "{replyingTo.content.substring(0, 150)}
                          {replyingTo.content.length > 150 ? "..." : ""}"
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      replyingTo
                        ? "Ask about the selected text..."
                        : "Type your doubt..."
                    }
                    className="flex-1 bg-gray-700/80 text-white placeholder-gray-400 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-gray-700 max-h-32 border border-gray-600/50 transition-all"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 p-3 rounded-lg transition-all duration-200 shadow-lg disabled:shadow-none"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {replyingTo && (
                  <p className="text-xs text-yellow-400/70 mt-2 flex items-center gap-1">
                    <Quote className="w-3 h-3" />
                    Selected text will be used as primary focus
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Chat Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Clear Chat?</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete all messages? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

DoubtChatbox.displayName = "DoubtChatbox";

export default DoubtChatbox;
