import React from "react";
import {motion} from "framer-motion";
function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
      >
        <motion.div
          className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"
          animate={{rotate: 360}}
          transition={{duration: 1, repeat: Infinity, ease: "linear"}}
        />
        <p className="text-gray-300 text-lg">Loading...</p>
      </motion.div>
    </div>
  );
}

export default Loading;
