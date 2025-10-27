"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Minimize2Icon } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import DoubtChatbox from "./DoubtChatbox";
import TextSelectionToolbar from "./TextSelectionToolbar";

const SubtopicSidebar = ({
  sidebarOpen,
  sidebarClose,
  subtopicData,
  allSubtopicsData = [],
  chatId,
  chatData,
  children,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const doubtChatboxRef = React.useRef(null);

  // Listen for clear selected text event from DoubtChatbox
  React.useEffect(() => {
    const handleClearSelectedText = () => {
      setSelectedText("");
    };

    window.addEventListener("clearSelectedText", handleClearSelectedText);
    return () => {
      window.removeEventListener("clearSelectedText", handleClearSelectedText);
    };
  }, []);

  // Handle ask doubt from toolbar
  const handleAskDoubtFromToolbar = (text) => {
    // Set selected text only when ask doubt is clicked
    setSelectedText(text);
    if (doubtChatboxRef.current) {
      doubtChatboxRef.current.openWithText(text);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  // Helper to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/g;
    const match = regExp.exec(url);
    return match ? match[1] : null;
  };

  // Helper function to render text with markdown-like formatting
  const renderFormattedText = (text) => {
    if (!text) return "";

    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <span className="text-gray-200 text-base font-normal leading-relaxed">
              {children}
            </span>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-300 italic">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  // Render different content types based on the new data structure
  const renderContentItem = (item, index) => {
    switch (item.type) {
      case "text":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            <div className="text-gray-200 text-base font-normal leading-relaxed">
              {renderFormattedText(item.value)}
            </div>
          </motion.div>
        );

      case "bullet":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            <ul className="list-disc pl-6 space-y-2">
              {item.items?.map((bulletItem, bulletIndex) => (
                <li
                  key={bulletIndex}
                  className="text-gray-200 text-base font-normal leading-relaxed marker:text-blue-400"
                >
                  {renderFormattedText(bulletItem)}
                </li>
              ))}
            </ul>
          </motion.div>
        );

      case "table":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-600 rounded-lg overflow-hidden bg-gray-800/30">
                {item.headers && (
                  <thead className="bg-gray-700">
                    <tr>
                      {item.headers.map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-gray-600/50 last:border-r-0"
                        >
                          {renderFormattedText(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="bg-gray-900/30">
                  {item.rows?.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-gray-600/50 hover:bg-gray-700/20 transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-200 border-r border-gray-600/50 last:border-r-0"
                        >
                          {renderFormattedText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );

      case "code":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            <div className="rounded-lg overflow-hidden border border-gray-700/50">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700/50">
                <span className="text-gray-400 text-sm font-medium">
                  {item.language || "code"}
                </span>
              </div>
              <pre className="bg-gray-900 p-4 overflow-x-auto">
                <code className="text-gray-200 text-sm font-mono leading-relaxed">
                  {item.value}
                </code>
              </pre>
            </div>
          </motion.div>
        );

      case "image":
        // return (
        //   <motion.div
        //     key={index}
        //     initial={{opacity: 0, y: 10}}
        //     animate={{opacity: 1, y: 0}}
        //     transition={{duration: 0.2, delay: index * 0.03}}
        //     className="mb-8"
        //   >
        //     {/* Section Heading if present */}
        //     {item.heading && (
        //       <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
        //         {item.heading}
        //       </h2>
        //     )}

        //     {item.caption && (
        //       <p className="text-gray-400 text-sm mb-2 italic">
        //         {item.caption}
        //       </p>
        //     )}
        //     <div className="rounded-lg overflow-hidden border border-gray-700/50 bg-gray-800/30">
        //       <img
        //         src={
        //           item.url ||
        //           "https://placehold.co/600x400/374151/9CA3AF?text=Image+Unavailable"
        //         }
        //         alt={item.alt || "Image"}
        //         className="w-full h-auto object-cover"
        //         onError={(e) => {
        //           e.target.onerror = null;
        //           e.target.src =
        //             "https://placehold.co/600x400/374151/9CA3AF?text=Image+Load+Error";
        //         }}
        //         loading="lazy"
        //       />
        //     </div>
        //   </motion.div>
        // );
        return null;
        // case "youtube":
        //   const videoId = getYouTubeVideoId(item.url || "");
        //   return (
        //     <motion.div
        //       key={index}
        //       initial={{opacity: 0, y: 10}}
        //       animate={{opacity: 1, y: 0}}
        //       transition={{duration: 0.2, delay: index * 0.03}}
        //       className="mb-8"
        //     >
        //       {/* Section Heading if present */}
        //       {item.heading && (
        //         <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
        //           {item.heading}
        //         </h2>
        //       )}

        //       {item.videoTitle && (
        //         <p className="text-gray-400 text-sm mb-4 italic">
        //           {item.videoTitle}
        //         </p>
        //       )}

        //       {videoId ? (
        //         <div className="relative w-full rounded-lg overflow-hidden border border-gray-700/50 bg-gray-900">
        //           <div style={{paddingBottom: "56.25%"}} className="relative">
        //             <iframe
        //               className="absolute top-0 left-0 w-full h-full"
        //               src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&showinfo=0&controls=1&disablekb=0&enablejsapi=0&autoplay=0&origin=${
        //                 typeof window !== "undefined"
        //                   ? window.location.origin
        //                   : ""
        //               }`}
        //               title={item.videoTitle || "Educational video"}
        //               frameBorder="0"
        //               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        //               referrerPolicy="strict-origin-when-cross-origin"
        //               allowFullScreen
        //               loading="lazy"
        //             ></iframe>
        //           </div>
        //         </div>
        //       ) : (
        //         <div className="w-full h-32 bg-gray-800 border border-gray-700/50 rounded-lg flex items-center justify-center">
        //           <div className="text-center">
        //             <div className="text-2xl mb-2">🎥</div>
        //             <div className="text-gray-400 text-sm">
        //               Video not available
        //             </div>
        //           </div>
        //         </div>
        //       )}
        //     </motion.div>
        //   );

        // case "video":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            {item.videoTitle && (
              <p className="text-gray-400 text-sm mb-4 italic">
                {item.videoTitle}
              </p>
            )}

            {item.url ? (
              <VideoPlayer
                src={item.url}
                title={item.videoTitle || item.heading || "Video"}
                poster={item.poster}
                className="w-full aspect-video"
                autoPlay={item.autoPlay || false}
                loop={item.loop || false}
                muted={item.muted || false}
              />
            ) : (
              <div className="w-full h-32 bg-gray-800 border border-gray-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎥</div>
                  <div className="text-gray-400 text-sm">
                    Video source not available
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      case "practiceQuestions":
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="mb-8"
          >
            {/* Section Heading if present */}
            {item.heading && (
              <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
                {item.heading}
              </h2>
            )}

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">?</span>
                </div>
                <span className="text-blue-300 font-medium text-sm">
                  Practice Questions
                </span>
              </div>

              <ol className="list-decimal pl-6 space-y-3">
                {item.items?.map((question, questionIndex) => (
                  <li
                    key={questionIndex}
                    className="text-gray-200 text-base font-normal leading-relaxed marker:text-blue-400"
                  >
                    {renderFormattedText(question)}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Sidebar content component with enhanced layout
  const SidebarContent = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "p-4" : "p-6"} h-full flex flex-col bg-gray-900`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
        <div className="flex-1 pr-4">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {subtopicData?.aiResponse?.title || "Learning Content"}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                // Exit fullscreen icon
                <Minimize2Icon className="w-5 h-5 text-gray-400 hover:text-white" />
              ) : (
                // Enter fullscreen icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"
                />
              )}
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={sidebarClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
        <div className="space-y-6">
          {/* Render existing content if available */}
          {subtopicData?.aiResponse?.content ? (
            subtopicData?.aiResponse?.content.map((item, index) =>
              renderContentItem(item, index)
            )
          ) : (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse mb-8">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-800 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Always show VideoPlayer component at the bottom */}
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700/30 pb-2">
              Video Content
            </h2>
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              title={subtopicData?.aiResponse?.title || "Educational Video"}
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              className="w-full aspect-video"
              autoPlay={false}
              loop={false}
              muted={false}
            />
          </motion.div> */}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Text Selection Toolbar */}
      <TextSelectionToolbar onAskDoubt={handleAskDoubtFromToolbar} />

      {/* Doubt Chatbox - Available globally */}
      <DoubtChatbox
        ref={doubtChatboxRef}
        currentSubtopicData={subtopicData}
        allSubtopicsData={allSubtopicsData}
        selectedText={selectedText}
        chatId={chatId}
        chatData={chatData}
      />

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:flex h-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 font-sans antialiased">
        {/* Main Content */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            sidebarOpen
              ? isFullscreen
                ? "hidden"
                : "md:w-1/2 lg:w-2/3"
              : "w-full"
          }`}
        >
          {children}
        </div>
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4,
              }}
              className={`${
                isFullscreen
                  ? "w-full"
                  : "md:w-1/2 lg:w-1/3 xl:w-2/5 max-w-[500px]"
              } bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-l border-gray-700/50 shadow-2xl overflow-hidden flex flex-col backdrop-blur-sm transition-all duration-500`}
            >
              <SidebarContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 font-sans antialiased">
        {/* Main Content */}
        <div
          className={`w-full h-full ${
            sidebarOpen && isFullscreen ? "hidden" : ""
          }`}
        >
          {children}
        </div>
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop - only show if not fullscreen */}
              {!isFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={sidebarClose}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                />
              )}

              {/* Sidebar */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  duration: 0.4,
                }}
                className={`fixed top-0 right-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 ${
                  isFullscreen ? "z-60" : "z-50"
                } overflow-hidden flex flex-col`}
              >
                <SidebarContent isMobile={true} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SubtopicSidebar;
