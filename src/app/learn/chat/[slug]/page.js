"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import {useAuth} from "@/contexts/AuthContext";
import {getSingleChat} from "@/lib/db";
import {usePathname, useRouter} from "next/navigation";
import {motion} from "framer-motion";
import React, {useEffect, useState} from "react";
import BackBtn from "@/components/backBtn";
import Loading from "@/components/loading";
import MindMap from "@/components/mindmap";
import {
  formatDate,
  formatTime,
  formatTimeAgo,
} from "../../../../../utils/formatTime";
import SubtopicSidebar from "@/components/SubtopicSidebar";

function Page() {
  const slug = usePathname().slice(12); // Extract slug from path
  const router = useRouter();
  const {user, userData} = useAuth();
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState();
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  useEffect(() => {
    console.log("Sidebar open state:", sidebarOpen);
  }, [sidebarOpen]);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const fetchChat = async () => {
      const res = await getSingleChat(slug, user?.uid);
      if (res.success) {
        // Handle successful chat retrieval
        setChatData(res.data);
        setLoading(false);
        // console.log("Chat data:", res.data);
      } else {
        // Handle error in chat retrieval
        console.error("Error fetching chat:", res.message);
        setError(res.message);
        setErrorCode(res.code);
        setLoading(false);
        // router.push("/learn");
      }
    };
    fetchChat();
    // setLoading(false);
  }, [router, slug, user]);
  //   unauthorized access
  if (errorCode === 403) {
    return (
      <div className="min-h-[80vh] md:min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full mb-6"
            whileHover={{scale: 1.1}}
          >
            <span className="text-3xl">🚫</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-400 mb-8">
            {error || "You don't have permission to access this chat"}
          </p>
          <div className="space-y-4">
            <motion.button
              onClick={() => router.push("/learn")}
              className="block w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-center"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Back to Learn
            </motion.button>
            <motion.button
              onClick={() => router.push("/")}
              className="block w-full py-3 bg-gray-700 text-white font-medium rounded-xl text-center border border-gray-600"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }
  // Chat not found
  if (errorCode === 404) {
    return (
      <div className="min-h-[80vh] md:min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6"
            whileHover={{scale: 1.1}}
          >
            <span className="text-3xl">❓</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Chat Not Found</h1>
          <p className="text-gray-400 mb-8">
            The chat you are looking for does not exist or has been deleted.
          </p>
          <div className="space-y-4">
            <motion.button
              onClick={() => router.push("/learn")}
              className="block w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-center"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Back to Learn
            </motion.button>
            <motion.button
              onClick={() => router.push("/")}
              className="block w-full py-3 bg-gray-700 text-white font-medium rounded-xl text-center border border-gray-600"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }
  // Server error
  if (errorCode === 500) {
    return (
      <div className="min-h-[80vh] md:min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full mb-6"
            whileHover={{scale: 1.1}}
          >
            <span className="text-3xl">⚠️</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-400 mb-8">
            {error || "An unexpected error occurred while fetching the chat."}
          </p>
          <div className="space-y-4">
            <motion.button
              onClick={() => router.push("/learn")}
              className="block w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-xl text-center"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Back to Learn
            </motion.button>
            <motion.button
              onClick={() => router.push("/")}
              className="block w-full py-3 bg-gray-700 text-white font-medium rounded-xl text-center border border-gray-600"
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }
  // Loading state
  if (loading) {
    return <Loading />;
  }

  return (
    <SubtopicSidebar
      sidebarClose={closeSidebar}
      // sidebarOpen={sidebarOpen}
      subtopicData={selectedSubtopic}
      sidebarOpen={sidebarOpen}
    >
      <div className="flex flex-row h-screen justify-between overflow-x-hidden">
        <div className={`w-full md:p-12 p-5 h-screen  overflow-y-hidden`}>
          <div className="flex flex-col gap-6 h-full w-full">
            <div className="flex items-center justify-between w-full border-b border-gray-700 pb-4 mb-4">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <BackBtn />
                <div className="text-sm md:text-lg lg:text-2xl font-bold truncate min-w-0 md:max-w-full max-basis-1/3 flex-1">
                  {chatData?.aiResponse?.courseTitle ||
                    chatData?.topic ||
                    "Untitled Chat"}
                </div>
              </div>
              <div className="text-gray-400 font-medium ml-2 flex-shrink-0">
                <div className="text-xs md:text-sm flex flex-col text-right">
                  <span>{formatDate(chatData?.timestamp)}</span>
                  <span>{formatTime(chatData?.timestamp)}</span>
                </div>
              </div>
            </div>
            <MindMap
              chatData={chatData}
              chatId={slug}
              mindmapState={chatData?.mindmapState}
              closeSidebar={closeSidebar}
              openSidebar={openSidebar}
              setSelectedSubTopic={setSelectedSubtopic}
            />
          </div>
        </div>
        {/* <div
        className={`
        ${sidebarOpen ? "" : "hidden"} `}
      >
       
      </div> */}
      </div>
    </SubtopicSidebar>
  );
}

export default Page;
