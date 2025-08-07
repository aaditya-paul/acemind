import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {generateUniqueId} from "../../utils/IDGen";
import {db} from "./firebase";

// Helper function to sanitize data for Firebase (removes nested arrays)
function sanitizeForFirebase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    // Convert nested arrays to objects with index keys
    return obj.map((item, index) => {
      if (Array.isArray(item)) {
        // Convert nested array to object with indexed keys
        return {
          __isArray: true,
          __arrayData: item.reduce((acc, subItem, subIndex) => {
            acc[`item_${subIndex}`] = sanitizeForFirebase(subItem);
            return acc;
          }, {}),
        };
      } else if (typeof item === "object" && item !== null) {
        return sanitizeForFirebase(item);
      }
      return item;
    });
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        // Check if array contains nested arrays
        const hasNestedArrays = value.some((item) => Array.isArray(item));
        if (hasNestedArrays) {
          sanitized[key] = {
            __isArray: true,
            __arrayData: value.reduce((acc, item, index) => {
              acc[`item_${index}`] = sanitizeForFirebase(item);
              return acc;
            }, {}),
          };
        } else {
          sanitized[key] = sanitizeForFirebase(value);
        }
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeForFirebase(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return obj;
}

// Helper function to check for nested arrays in an object (for debugging)
function checkForNestedArrays(obj, path = "") {
  if (obj === null || obj === undefined) {
    return [];
  }

  const nestedArrays = [];

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (Array.isArray(item)) {
        nestedArrays.push(`${path}[${index}] contains nested array`);
      } else if (typeof item === "object" && item !== null) {
        nestedArrays.push(...checkForNestedArrays(item, `${path}[${index}]`));
      }
    });
  } else if (typeof obj === "object") {
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const hasNestedArrays = value.some((item) => Array.isArray(item));
        if (hasNestedArrays) {
          nestedArrays.push(`${path}.${key} contains nested arrays`);
        }
        nestedArrays.push(...checkForNestedArrays(value, `${path}.${key}`));
      } else if (typeof value === "object" && value !== null) {
        nestedArrays.push(...checkForNestedArrays(value, `${path}.${key}`));
      }
    });
  }

  return nestedArrays;
}

// Helper function to restore data from Firebase (converts objects back to arrays)
function restoreFromFirebase(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => restoreFromFirebase(item));
  }

  if (typeof obj === "object") {
    if (obj.__isArray && obj.__arrayData) {
      // Restore array from object
      const keys = Object.keys(obj.__arrayData).sort((a, b) => {
        const aIndex = parseInt(a.split("_")[1]);
        const bIndex = parseInt(b.split("_")[1]);
        return aIndex - bIndex;
      });
      return keys.map((key) => restoreFromFirebase(obj.__arrayData[key]));
    }

    const restored = {};
    for (const [key, value] of Object.entries(obj)) {
      restored[key] = restoreFromFirebase(value);
    }
    return restored;
  }

  return obj;
}

export async function setResponseDB(response, uid) {
  const chat_id = generateUniqueId("chat_");
  if (response === null || response === undefined) {
    return {success: false, message: "Response is null or undefined"};
  }
  try {
    // set in user's collection in Firestore
    await setDoc(
      doc(db, "users", uid),
      {
        chats: arrayUnion({
          // topic: response.topic,
          // syllabus: response.syllabus,
          // aiResponse: response.aiResponse,
          // userId: uid,
          timestamp: new Date().toISOString(),
          chatId: chat_id,
        }),
      },
      {merge: true}
    );

    // Sanitize the aiResponse to prevent nested array issues
    const sanitizedAiResponse = response.aiResponse
      ? sanitizeForFirebase(response.aiResponse)
      : response.aiResponse;

    // set in 'chats' collection in Firestore
    await setDoc(
      doc(db, "chats", chat_id),
      {
        topic: response.topic,
        syllabus: response.syllabus,
        aiResponse: sanitizedAiResponse,
        timestamp: new Date().toISOString(),
        userId: uid,
        chatId: chat_id,
        syllabusContext: response.syllabusContext,
      },
      {merge: true}
    );
    return {
      success: true,
      message: "Response saved successfully",
      chatId: chat_id,
    };
  } catch (error) {
    console.error("Error setting response in DB:", error);
    return {success: false, message: "Failed to save response"};
  }
}

export async function getChats(uid) {
  try {
    const chatsRef = collection(db, "chats");
    const chatsQuery = query(chatsRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(chatsQuery);
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push(doc.data());
    });
    return {success: true, chats};
  } catch (error) {
    console.error("Error getting chats:", error);
    return {success: false, message: "Failed to get chats"};
  }
}

export async function getSingleChat(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }
    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Restore any sanitized nested arrays in the chat data
    const restoredChatData = {
      ...chatData,
      aiResponse: chatData.aiResponse
        ? restoreFromFirebase(chatData.aiResponse)
        : chatData.aiResponse,
      subtopicData: chatData.subtopicData
        ? restoreFromFirebase(chatData.subtopicData)
        : chatData.subtopicData,
    };

    return {success: true, data: restoredChatData, code: 200};
  } catch (error) {
    console.error("Error getting single chat:", error);
    return {success: false, message: "Failed to get single chat", code: 500};
  }
}

export async function deleteSingleChat(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const userChatref = doc(db, "users", uid);
    const userDoc = await getDoc(userChatref);
    if (!userDoc.exists()) {
      return {success: false, message: "User not found", code: 404};
    }
    // Remove chat from user's chats array
    if (userDoc.data().uid !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }
    await setDoc(
      userChatref,
      {
        chats: userDoc.data().chats.filter((chat) => chat.chatId !== chatID),
      },
      {merge: true}
    );

    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }
    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }
    await deleteDoc(chatRef);
    return {success: true, message: "Chat deleted successfully", code: 200};
  } catch (error) {
    console.error("Error deleting single chat:", error);
    return {success: false, message: "Failed to delete single chat", code: 500};
  }
}

export async function saveMindmapState(chatID, uid, mindmapState) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    await setDoc(
      chatRef,
      {
        mindmapState: {
          expandedUnits: Array.from(mindmapState.expandedUnits),
          viewport: mindmapState.viewport,
          nodePositions: mindmapState.nodePositions,
          savedAt: new Date().toISOString(),
        },
      },
      {merge: true}
    );

    return {
      success: true,
      message: "Mindmap state saved successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error saving mindmap state:", error);
    return {success: false, message: "Failed to save mindmap state", code: 500};
  }
}

// Set/Save subtopic data to database
export async function setSubtopicDataDB(chatID, uid, subtopicData) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Create subtopic key for storage
    const subtopicKey = `${subtopicData.unitIndex}-${subtopicData.subTopicIndex}`;

    // Sanitize the entire subtopic data object to handle all potential nested arrays
    const sanitizedSubtopicData = sanitizeForFirebase({
      ...subtopicData,
      // Add proper timestamp
      savedAt: new Date().toISOString(),
      // Ensure proper type indicators
      dataType: "regular_subtopic",
      version: "2.0",
    });

    await setDoc(
      chatRef,
      {
        subtopicData: {
          [subtopicKey]: sanitizedSubtopicData,
        },
      },
      {merge: true}
    );

    console.log(`💾 Saved regular subtopic data for key: ${subtopicKey}`);

    return {
      success: true,
      message: "Subtopic data saved successfully",
      data: sanitizedSubtopicData,
      code: 200,
    };
  } catch (error) {
    console.error("Error saving subtopic data:", error);
    return {success: false, message: "Failed to save subtopic data", code: 500};
  }
}

// Get subtopic data from database
export async function getSubtopicDataDB(chatID, uid, unitIndex, subTopicIndex) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    const subtopicKey = `${unitIndex}-${subTopicIndex}`;
    const subtopicData = chatData.subtopicData?.[subtopicKey];

    if (!subtopicData) {
      return {success: false, message: "Subtopic data not found", code: 404};
    }

    // Restore the entire subtopic data object from sanitized format
    const restoredSubtopicData = {
      ...restoreFromFirebase(subtopicData),
      // Ensure proper number types
      unitIndex:
        typeof subtopicData.unitIndex === "number"
          ? subtopicData.unitIndex
          : unitIndex,
      subTopicIndex:
        typeof subtopicData.subTopicIndex === "number"
          ? subtopicData.subTopicIndex
          : subTopicIndex,
      // Add cache indicator
      fromCache: true,
      cacheTimestamp: subtopicData.savedAt,
    };

    console.log(
      `📚 Retrieved regular subtopic data from cache for key: ${subtopicKey}`
    );

    return {
      success: true,
      data: restoredSubtopicData,
      fromCache: true,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting subtopic data:", error);
    return {success: false, message: "Failed to get subtopic data", code: 500};
  }
}

// Add expanded subtopics to the main course structure
export async function addExpandedSubtopics(
  chatID,
  uid,
  unitIndex,
  subTopicIndex,
  newSubtopics
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Parse the aiResponse if it's a string and restore sanitized data
    let courseData;
    try {
      courseData =
        typeof chatData.aiResponse === "string"
          ? JSON.parse(chatData.aiResponse)
          : chatData.aiResponse;

      // Restore any sanitized nested arrays
      courseData = restoreFromFirebase(courseData);
    } catch (e) {
      console.error("Error parsing aiResponse:", e);
      return {success: false, message: "Invalid course data format", code: 400};
    }

    // Create expanded subtopics structure
    const expandedSubtopicKey = `${unitIndex}-${subTopicIndex}`;

    // Update the course structure to include expanded subtopics
    if (!courseData.expandedSubtopics) {
      courseData.expandedSubtopics = {};
    }

    courseData.expandedSubtopics[expandedSubtopicKey] = {
      parentSubtopic: courseData.units[unitIndex]?.sub_topics[subTopicIndex],
      expandedTopics: newSubtopics,
      expandedAt: new Date().toISOString(),
    };

    // Sanitize the entire courseData before saving to prevent nested array issues
    const sanitizedCourseData = sanitizeForFirebase(courseData);

    // Save back to database
    await setDoc(
      chatRef,
      {
        aiResponse: sanitizedCourseData,
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

    return {
      success: true,
      message: "Expanded subtopics added successfully",
      data: courseData,
      code: 200,
    };
  } catch (error) {
    console.error("Error adding expanded subtopics:", error);
    return {
      success: false,
      message: "Failed to add expanded subtopics",
      code: 500,
    };
  }
}

// Get all expanded subtopics for a course
export async function getExpandedSubtopics(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Parse the aiResponse if it's a string and restore sanitized data
    let courseData;
    try {
      courseData =
        typeof chatData.aiResponse === "string"
          ? JSON.parse(chatData.aiResponse)
          : chatData.aiResponse;

      // Restore any sanitized nested arrays
      courseData = restoreFromFirebase(courseData);
    } catch (e) {
      console.error("Error parsing aiResponse:", e);
      return {success: false, message: "Invalid course data format", code: 400};
    }

    return {
      success: true,
      data: courseData.expandedSubtopics || {},
      code: 200,
    };
  } catch (error) {
    console.error("Error getting expanded subtopics:", error);
    return {
      success: false,
      message: "Failed to get expanded subtopics",
      code: 500,
    };
  }
}

// Enhanced function to add multi-level subtopics with infinite recursion support
export async function addMultiLevelSubtopics(
  chatID,
  uid,
  hierarchyPath,
  newSubtopics,
  parentTitle,
  level = 1
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Parse the aiResponse if it's a string and restore sanitized data
    let courseData;
    try {
      courseData =
        typeof chatData.aiResponse === "string"
          ? JSON.parse(chatData.aiResponse)
          : chatData.aiResponse;

      // Restore any sanitized nested arrays
      courseData = restoreFromFirebase(courseData);
    } catch (e) {
      console.error("Error parsing aiResponse:", e);
      return {success: false, message: "Invalid course data format", code: 400};
    }

    // Initialize expanded subtopics structure if it doesn't exist
    if (!courseData.expandedSubtopics) {
      courseData.expandedSubtopics = {};
    }

    // Create hierarchical key from the path array
    const hierarchyKey = hierarchyPath.join("-");

    // Store the expanded subtopics with metadata
    courseData.expandedSubtopics[hierarchyKey] = {
      parentTitle: parentTitle,
      expandedTopics: newSubtopics,
      level: level,
      hierarchyPath: hierarchyPath,
      expandedAt: new Date().toISOString(),
    };

    // Sanitize the entire courseData before saving to prevent nested array issues
    const sanitizedCourseData = sanitizeForFirebase(courseData);

    // Save back to database
    await setDoc(
      chatRef,
      {
        aiResponse: sanitizedCourseData,
        updatedAt: new Date().toISOString(),
      },
      {merge: true}
    );

    return {
      success: true,
      message: "Multi-level subtopics added successfully",
      data: courseData,
      hierarchyKey: hierarchyKey,
      code: 200,
    };
  } catch (error) {
    console.error("Error adding multi-level subtopics:", error);
    return {
      success: false,
      message: "Failed to add multi-level subtopics",
      code: 500,
    };
  }
}

// Enhanced function to save subtopic data with hierarchical support
export async function setHierarchicalSubtopicDataDB(
  chatID,
  uid,
  subtopicData,
  hierarchyPath
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Create hierarchical key for the subtopic data
    const hierarchyKey = hierarchyPath.join("-");

    // Debug: Check for nested arrays before sanitization
    const nestedArrays = checkForNestedArrays(subtopicData, "subtopicData");
    if (nestedArrays.length > 0) {
      console.warn(
        "🔍 Nested arrays detected before sanitization:",
        nestedArrays
      );
    }

    // Sanitize the entire subtopic data object to handle all potential nested arrays
    const sanitizedSubtopicData = sanitizeForFirebase({
      ...subtopicData,
      // Preserve hierarchy path as array
      hierarchyPath: Array.isArray(hierarchyPath) ? hierarchyPath : [],
      // Add proper timestamp
      savedAt: new Date().toISOString(),
      // Ensure proper type indicators
      dataType: "hierarchical_subtopic",
      version: "2.0",
    });

    // Debug: Check if any nested arrays remain after sanitization
    const remainingNestedArrays = checkForNestedArrays(
      sanitizedSubtopicData,
      "sanitizedData"
    );
    if (remainingNestedArrays.length > 0) {
      console.error(
        "❌ Nested arrays still present after sanitization:",
        remainingNestedArrays
      );
      console.error(
        "❌ Problematic data:",
        JSON.stringify(sanitizedSubtopicData, null, 2)
      );
    }

    await setDoc(
      chatRef,
      {
        subtopicData: {
          [hierarchyKey]: sanitizedSubtopicData,
        },
      },
      {merge: true}
    );

    console.log(`💾 Saved hierarchical subtopic data for key: ${hierarchyKey}`);

    return {
      success: true,
      message: "Hierarchical subtopic data saved successfully",
      hierarchyKey: hierarchyKey,
      data: sanitizedSubtopicData,
      code: 200,
    };
  } catch (error) {
    console.error("Error saving hierarchical subtopic data:", error);
    return {
      success: false,
      message: "Failed to save hierarchical subtopic data",
      code: 500,
    };
  }
}

// Enhanced function to get subtopic data with hierarchical support
export async function getHierarchicalSubtopicDataDB(
  chatID,
  uid,
  hierarchyPath
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    const hierarchyKey = hierarchyPath.join("-");
    const subtopicData = chatData.subtopicData?.[hierarchyKey];

    if (!subtopicData) {
      return {
        success: false,
        message: "Hierarchical subtopic data not found",
        code: 404,
      };
    }

    // Restore the entire subtopic data object from sanitized format
    const restoredSubtopicData = {
      ...restoreFromFirebase(subtopicData),
      // Ensure hierarchy path is restored as array
      hierarchyPath: Array.isArray(subtopicData.hierarchyPath)
        ? subtopicData.hierarchyPath
        : hierarchyPath, // fallback to provided path
      // Add cache indicator
      fromCache: true,
      cacheTimestamp: subtopicData.savedAt,
    };

    console.log(
      `📚 Retrieved hierarchical subtopic data from cache for key: ${hierarchyKey}`
    );

    return {
      success: true,
      data: restoredSubtopicData,
      hierarchyKey: hierarchyKey,
      fromCache: true,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting hierarchical subtopic data:", error);
    return {
      success: false,
      message: "Failed to get hierarchical subtopic data",
      code: 500,
    };
  }
}

// Function to get expansion statistics for analytics
export async function getExpansionStatistics(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    // Parse the aiResponse to get expanded subtopics data and restore sanitized data
    let courseData;
    try {
      courseData =
        typeof chatData.aiResponse === "string"
          ? JSON.parse(chatData.aiResponse)
          : chatData.aiResponse;

      // Restore any sanitized nested arrays
      courseData = restoreFromFirebase(courseData);
    } catch (e) {
      console.error("Error parsing aiResponse:", e);
      return {success: false, message: "Invalid course data format", code: 400};
    }

    const expandedSubtopics = courseData.expandedSubtopics || {};
    const subtopicData = chatData.subtopicData || {};

    // Calculate statistics
    const stats = {
      totalExpansions: Object.keys(expandedSubtopics).length,
      levelBreakdown: {},
      totalSubtopicsGenerated: 0,
      totalContentGenerated: Object.keys(subtopicData).length,
      maxDepthReached: 0,
      mostExpandedPath: null,
      mostExpandedCount: 0,
    };

    // Analyze expansion data
    Object.entries(expandedSubtopics).forEach(([key, data]) => {
      const level = data.level || 1;
      const pathDepth = data.hierarchyPath?.length || key.split("-").length;
      const subtopicsCount = data.expandedTopics?.length || 0;

      // Level breakdown
      if (!stats.levelBreakdown[level]) {
        stats.levelBreakdown[level] = {count: 0, subtopics: 0};
      }
      stats.levelBreakdown[level].count++;
      stats.levelBreakdown[level].subtopics += subtopicsCount;

      // Total subtopics
      stats.totalSubtopicsGenerated += subtopicsCount;

      // Max depth
      stats.maxDepthReached = Math.max(stats.maxDepthReached, pathDepth);

      // Most expanded path
      if (subtopicsCount > stats.mostExpandedCount) {
        stats.mostExpandedCount = subtopicsCount;
        stats.mostExpandedPath = key;
      }
    });

    return {
      success: true,
      data: stats,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting expansion statistics:", error);
    return {
      success: false,
      message: "Failed to get expansion statistics",
      code: 500,
    };
  }
}

// Utility function to clear cached subtopic data (for cache management)
export async function clearSubtopicCache(chatID, uid, hierarchyPath = null) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    if (hierarchyPath) {
      // Clear specific subtopic cache
      const hierarchyKey = hierarchyPath.join("-");
      const updatedSubtopicData = {...chatData.subtopicData};
      delete updatedSubtopicData[hierarchyKey];

      await setDoc(
        chatRef,
        {
          subtopicData: updatedSubtopicData,
          cacheCleared: new Date().toISOString(),
        },
        {merge: true}
      );

      console.log(`🗑️ Cleared cache for subtopic: ${hierarchyKey}`);
      return {
        success: true,
        message: `Cache cleared for subtopic: ${hierarchyKey}`,
        code: 200,
      };
    } else {
      // Clear all subtopic cache
      await setDoc(
        chatRef,
        {
          subtopicData: {},
          cacheCleared: new Date().toISOString(),
        },
        {merge: true}
      );

      console.log("🗑️ Cleared all subtopic cache");
      return {
        success: true,
        message: "All subtopic cache cleared",
        code: 200,
      };
    }
  } catch (error) {
    console.error("Error clearing subtopic cache:", error);
    return {
      success: false,
      message: "Failed to clear subtopic cache",
      code: 500,
    };
  }
}

// Function to get cache statistics
export async function getCacheStatistics(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return {success: false, message: "Chat not found", code: 404};
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return {success: false, message: "Unauthorized access", code: 403};
    }

    const subtopicData = chatData.subtopicData || {};

    const stats = {
      totalCachedItems: Object.keys(subtopicData).length,
      regularSubtopics: 0,
      hierarchicalSubtopics: 0,
      oldestCache: null,
      newestCache: null,
      totalCacheSize: JSON.stringify(subtopicData).length,
    };

    Object.entries(subtopicData).forEach(([key, data]) => {
      if (data.dataType === "regular_subtopic") {
        stats.regularSubtopics++;
      } else if (data.dataType === "hierarchical_subtopic") {
        stats.hierarchicalSubtopics++;
      }

      const cacheDate = new Date(data.savedAt);
      if (!stats.oldestCache || cacheDate < new Date(stats.oldestCache)) {
        stats.oldestCache = data.savedAt;
      }
      if (!stats.newestCache || cacheDate > new Date(stats.newestCache)) {
        stats.newestCache = data.savedAt;
      }
    });

    return {
      success: true,
      data: stats,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting cache statistics:", error);
    return {
      success: false,
      message: "Failed to get cache statistics",
      code: 500,
    };
  }
}
