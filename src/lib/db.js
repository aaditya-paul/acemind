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
import { generateUniqueId } from "../../utils/IDGen";
import { db } from "./firebase";

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
    return { success: false, message: "Response is null or undefined" };
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
      { merge: true },
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
      { merge: true },
    );
    return {
      success: true,
      message: "Response saved successfully",
      chatId: chat_id,
    };
  } catch (error) {
    console.error("Error setting response in DB:", error);
    return { success: false, message: "Failed to save response" };
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
    return { success: true, chats };
  } catch (error) {
    console.error("Error getting chats:", error);
    return { success: false, message: "Failed to get chats" };
  }
}

export async function getSingleChat(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }
    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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

    return { success: true, data: restoredChatData, code: 200 };
  } catch (error) {
    console.error("Error getting single chat:", error);
    return { success: false, message: "Failed to get single chat", code: 500 };
  }
}

export async function deleteSingleChat(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const userChatref = doc(db, "users", uid);
    const userDoc = await getDoc(userChatref);
    if (!userDoc.exists()) {
      return { success: false, message: "User not found", code: 404 };
    }
    // Remove chat from user's chats array
    if (userDoc.data().uid !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }
    await setDoc(
      userChatref,
      {
        chats: userDoc.data().chats.filter((chat) => chat.chatId !== chatID),
      },
      { merge: true },
    );

    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }
    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }
    await deleteDoc(chatRef);
    return { success: true, message: "Chat deleted successfully", code: 200 };
  } catch (error) {
    console.error("Error deleting single chat:", error);
    return {
      success: false,
      message: "Failed to delete single chat",
      code: 500,
    };
  }
}

export async function saveMindmapState(chatID, uid, mindmapState) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      { merge: true },
    );

    return {
      success: true,
      message: "Mindmap state saved successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error saving mindmap state:", error);
    return {
      success: false,
      message: "Failed to save mindmap state",
      code: 500,
    };
  }
}

// Set/Save subtopic data to database
export async function setSubtopicDataDB(chatID, uid, subtopicData) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      { merge: true },
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
    return {
      success: false,
      message: "Failed to save subtopic data",
      code: 500,
    };
  }
}

// Get subtopic data from database
export async function getSubtopicDataDB(chatID, uid, unitIndex, subTopicIndex) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    const subtopicKey = `${unitIndex}-${subTopicIndex}`;
    const subtopicData = chatData.subtopicData?.[subtopicKey];

    if (!subtopicData) {
      return { success: false, message: "Subtopic data not found", code: 404 };
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
      `📚 Retrieved regular subtopic data from cache for key: ${subtopicKey}`,
    );

    return {
      success: true,
      data: restoredSubtopicData,
      fromCache: true,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting subtopic data:", error);
    return {
      success: false,
      message: "Failed to get subtopic data",
      code: 500,
    };
  }
}

// Add expanded subtopics to the main course structure
export async function addExpandedSubtopics(
  chatID,
  uid,
  unitIndex,
  subTopicIndex,
  newSubtopics,
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      return {
        success: false,
        message: "Invalid course data format",
        code: 400,
      };
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
      { merge: true },
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
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      return {
        success: false,
        message: "Invalid course data format",
        code: 400,
      };
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
  level = 1,
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      return {
        success: false,
        message: "Invalid course data format",
        code: 400,
      };
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
      { merge: true },
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
  hierarchyPath,
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    // Create hierarchical key for the subtopic data
    const hierarchyKey = hierarchyPath.join("-");

    // Debug: Check for nested arrays before sanitization
    const nestedArrays = checkForNestedArrays(subtopicData, "subtopicData");
    if (nestedArrays.length > 0) {
      console.warn(
        "🔍 Nested arrays detected before sanitization:",
        nestedArrays,
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
      "sanitizedData",
    );
    if (remainingNestedArrays.length > 0) {
      console.error(
        "❌ Nested arrays still present after sanitization:",
        remainingNestedArrays,
      );
      console.error(
        "❌ Problematic data:",
        JSON.stringify(sanitizedSubtopicData, null, 2),
      );
    }

    await setDoc(
      chatRef,
      {
        subtopicData: {
          [hierarchyKey]: sanitizedSubtopicData,
        },
      },
      { merge: true },
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
  hierarchyPath,
) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      `📚 Retrieved hierarchical subtopic data from cache for key: ${hierarchyKey}`,
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
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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
      return {
        success: false,
        message: "Invalid course data format",
        code: 400,
      };
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
        stats.levelBreakdown[level] = { count: 0, subtopics: 0 };
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
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    if (hierarchyPath) {
      // Clear specific subtopic cache
      const hierarchyKey = hierarchyPath.join("-");
      const updatedSubtopicData = { ...chatData.subtopicData };
      delete updatedSubtopicData[hierarchyKey];

      await setDoc(
        chatRef,
        {
          subtopicData: updatedSubtopicData,
          cacheCleared: new Date().toISOString(),
        },
        { merge: true },
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
        { merge: true },
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
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
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

// ==================== DOUBT CHAT FUNCTIONS ====================

// Save a doubt message (question or answer)
export async function saveDoubtMessage(chatID, uid, message) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    // Initialize doubtMessages array if it doesn't exist
    const doubtMessages = chatData.doubtMessages || [];

    // Add new message with timestamp
    const newMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    doubtMessages.push(newMessage);

    await setDoc(
      chatRef,
      {
        doubtMessages: doubtMessages,
        lastDoubtMessageAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return {
      success: true,
      message: "Doubt message saved successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error saving doubt message:", error);
    return {
      success: false,
      message: "Failed to save doubt message",
      code: 500,
    };
  }
}

// Get all doubt messages for a chat
export async function getDoubtMessages(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    const doubtMessages = chatData.doubtMessages || [];

    return {
      success: true,
      data: doubtMessages,
      code: 200,
    };
  } catch (error) {
    console.error("Error getting doubt messages:", error);
    return {
      success: false,
      message: "Failed to get doubt messages",
      code: 500,
    };
  }
}

// Delete a specific doubt message by ID
export async function deleteDoubtMessage(chatID, uid, messageId) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    const doubtMessages = chatData.doubtMessages || [];
    const updatedMessages = doubtMessages.filter((msg) => msg.id !== messageId);

    await setDoc(
      chatRef,
      {
        doubtMessages: updatedMessages,
        lastDoubtMessageDeletedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return {
      success: true,
      message: "Doubt message deleted successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error deleting doubt message:", error);
    return {
      success: false,
      message: "Failed to delete doubt message",
      code: 500,
    };
  }
}

// Clear all doubt messages for a chat
export async function clearAllDoubtMessages(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    await setDoc(
      chatRef,
      {
        doubtMessages: [],
        lastDoubtMessagesClearedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return {
      success: true,
      message: "All doubt messages cleared successfully",
      code: 200,
    };
  } catch (error) {
    console.error("Error clearing doubt messages:", error);
    return {
      success: false,
      message: "Failed to clear doubt messages",
      code: 500,
    };
  }
}

// ============= QUIZ SYSTEM FUNCTIONS =============

// Save quiz progress and results
export async function saveQuizResult(chatID, uid, quizData) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    const quizResult = {
      id: generateUniqueId(),
      ...quizData,
      timestamp: new Date().toISOString(),
    };

    await setDoc(
      chatRef,
      {
        quizResults: arrayUnion(quizResult),
        totalQuizzesTaken: (chatData.totalQuizzesTaken || 0) + 1,
        lastQuizTakenAt: new Date().toISOString(),
      },
      { merge: true },
    );

    // Update user stats
    await updateUserQuizStats(uid, quizResult);

    return {
      success: true,
      message: "Quiz result saved successfully",
      data: quizResult,
      code: 200,
    };
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return {
      success: false,
      message: "Failed to save quiz result",
      code: 500,
    };
  }
}

// Get all quiz results for a chat
export async function getQuizResults(chatID, uid) {
  try {
    const chatRef = doc(db, "chats", chatID);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found", code: 404 };
    }

    const chatData = chatDoc.data();
    if (chatData.userId !== uid) {
      return { success: false, message: "Unauthorized access", code: 403 };
    }

    return {
      success: true,
      data: chatData.quizResults || [],
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return {
      success: false,
      message: "Failed to fetch quiz results",
      code: 500,
    };
  }
}

// Update user-wide quiz statistics
async function updateUserQuizStats(uid, quizResult) {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return;
    }

    const userData = userDoc.data();
    const currentStats = userData.quizStats || {
      totalQuizzes: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0,
      averageScore: 0,
      highestScore: 0,
      streakCount: 0,
      lastQuizDate: null,
      level: 1,
      xp: 0,
    };

    const newStats = {
      totalQuizzes: currentStats.totalQuizzes + 1,
      totalQuestions: currentStats.totalQuestions + quizResult.totalQuestions,
      totalCorrect: currentStats.totalCorrect + quizResult.correctAnswers,
      totalTime: currentStats.totalTime + quizResult.timeTaken,
      averageScore:
        (currentStats.averageScore * currentStats.totalQuizzes +
          quizResult.score) /
        (currentStats.totalQuizzes + 1),
      highestScore: Math.max(currentStats.highestScore, quizResult.score),
      lastQuizDate: new Date().toISOString(),
    };

    // Calculate XP and level (more balanced formula)
    // Base XP from score + bonus per correct answer
    const xpGained = Math.floor(
      quizResult.score * 0.5 + quizResult.correctAnswers * 2,
    );
    newStats.xp = currentStats.xp + xpGained;

    // Exponential level progression: each level requires more XP
    // Level 1: 0-200 XP, Level 2: 200-450 XP, Level 3: 450-750 XP, etc.
    let level = 1;
    let totalXpNeeded = 0;
    while (totalXpNeeded <= newStats.xp) {
      totalXpNeeded += 200 + (level - 1) * 50; // Each level needs 50 more XP than previous
      if (totalXpNeeded <= newStats.xp) level++;
    }
    newStats.level = level;

    // Calculate streak
    const lastQuizDate = currentStats.lastQuizDate
      ? new Date(currentStats.lastQuizDate)
      : null;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (
      lastQuizDate &&
      today - lastQuizDate < oneDayMs &&
      today.toDateString() !== lastQuizDate.toDateString()
    ) {
      newStats.streakCount = currentStats.streakCount + 1;
    } else if (!lastQuizDate || today - lastQuizDate >= oneDayMs * 2) {
      newStats.streakCount = 1;
    } else {
      newStats.streakCount = currentStats.streakCount;
    }

    await setDoc(userRef, { quizStats: newStats }, { merge: true });
  } catch (error) {
    console.error("Error updating user quiz stats:", error);
  }
}

// Get user quiz statistics
export async function getUserQuizStats(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "User not found",
        code: 404,
      };
    }

    const userData = userDoc.data();
    return {
      success: true,
      data: userData.quizStats || {
        totalQuizzes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalTime: 0,
        averageScore: 0,
        highestScore: 0,
        streakCount: 0,
        lastQuizDate: null,
        level: 1,
        xp: 0,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching user quiz stats:", error);
    return {
      success: false,
      message: "Failed to fetch quiz stats",
      code: 500,
    };
  }
}

// Get user profile by UID (for viewing other user profiles)
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "User not found",
        code: 404,
      };
    }

    const userData = userDoc.data();

    // Return public profile data only
    return {
      success: true,
      data: {
        uid: uid,
        displayName: userData.displayName || "Anonymous User",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        photoURL: userData.photoURL || null,
        bio: userData.profile?.bio || "",
        interests: userData.profile?.interests || [],
        quizStats: userData.quizStats || {
          totalQuizzes: 0,
          averageScore: 0,
          highestScore: 0,
          level: 1,
          xp: 0,
        },
        joinedDate: userData.createdAt || null,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      message: "Failed to fetch user profile",
      code: 500,
    };
  }
}

// Get leaderboard data (all users sorted by XP/level)
export async function getLeaderboard(limit = 100) {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        displayName: data.displayName || "Anonymous User",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        photoURL: data.photoURL || null,
        quizStats: data.quizStats || {
          totalQuizzes: 0,
          averageScore: 0,
          highestScore: 0,
          level: 1,
          xp: 0,
        },
      });
    });

    // Sort by level (descending), then by XP (descending)
    users.sort((a, b) => {
      if (b.quizStats.level !== a.quizStats.level) {
        return b.quizStats.level - a.quizStats.level;
      }
      return b.quizStats.xp - a.quizStats.xp;
    });

    // Limit results
    const limitedUsers = users.slice(0, limit);

    return {
      success: true,
      data: limitedUsers,
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      success: false,
      message: "Failed to fetch leaderboard",
      code: 500,
    };
  }
}

// ==================== CHALLENGE DUEL FUNCTIONS ====================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function createDuelAttemptSummary(result) {
  const score = Number(result?.score) || 0;
  const totalQuestions = Number(result?.totalQuestions) || 0;
  const correctAnswers = Number(result?.correctAnswers) || 0;
  const timeTaken = Number(result?.timeTaken) || 0;

  return {
    score,
    totalQuestions,
    correctAnswers,
    wrongAnswers: Math.max(0, totalQuestions - correctAnswers),
    timeTaken,
    difficulty: result?.difficulty || "intermediate",
    quizTitle: result?.quizTitle || "Duel Quiz",
    accuracy:
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0,
    submittedAt: new Date().toISOString(),
  };
}

function decideDuelWinner(
  challengerId,
  opponentId,
  challengerAttempt,
  opponentAttempt,
) {
  if (challengerAttempt.score > opponentAttempt.score) {
    return { winnerId: challengerId, isDraw: false };
  }

  if (opponentAttempt.score > challengerAttempt.score) {
    return { winnerId: opponentId, isDraw: false };
  }

  if (challengerAttempt.timeTaken < opponentAttempt.timeTaken) {
    return { winnerId: challengerId, isDraw: false };
  }

  if (opponentAttempt.timeTaken < challengerAttempt.timeTaken) {
    return { winnerId: opponentId, isDraw: false };
  }

  return { winnerId: null, isDraw: true };
}

export async function findUserByEmail(email) {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return {
        success: false,
        message: "Email is required",
        code: 400,
      };
    }

    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("email", "==", normalizedEmail));
    const querySnapshot = await getDocs(usersQuery);

    if (querySnapshot.empty) {
      return {
        success: false,
        message: "User not found",
        code: 404,
      };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
      success: true,
      data: {
        uid: userDoc.id,
        email: userData.email || normalizedEmail,
        displayName: userData.displayName || "Anonymous User",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        photoURL: userData.photoURL || null,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error finding user by email:", error);
    return {
      success: false,
      message: "Failed to find user",
      code: 500,
    };
  }
}

export async function createDuelChallenge(payload) {
  try {
    const {
      challengerId,
      challengerName,
      challengerEmail,
      opponentId,
      opponentName,
      opponentEmail,
      chatId,
      courseTitle,
      courseContext,
      difficulty = "intermediate",
      questionCount = 12,
      timeLimit = 600,
    } = payload || {};

    if (!challengerId || !opponentId) {
      return {
        success: false,
        message: "Both challenger and opponent are required",
        code: 400,
      };
    }

    if (challengerId === opponentId) {
      return {
        success: false,
        message: "You cannot challenge yourself",
        code: 400,
      };
    }

    const duelId = generateUniqueId("duel_");
    const now = new Date().toISOString();

    const duelData = {
      duelId,
      challengerId,
      challengerName: challengerName || "Challenger",
      challengerEmail: normalizeEmail(challengerEmail),
      opponentId,
      opponentName: opponentName || "Opponent",
      opponentEmail: normalizeEmail(opponentEmail),
      status: "pending",
      course: {
        chatId: chatId || null,
        title: courseTitle || "General Course",
      },
      courseContext: String(courseContext || "").slice(0, 2000),
      quizConfig: {
        difficulty,
        questionCount: Number(questionCount) || 12,
        timeLimit: Number(timeLimit) || 600,
      },
      attempts: {},
      winnerId: null,
      isDraw: false,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "duels", duelId), duelData);

    return {
      success: true,
      data: duelData,
      code: 200,
    };
  } catch (error) {
    console.error("Error creating duel challenge:", error);
    return {
      success: false,
      message: "Failed to create challenge",
      code: 500,
    };
  }
}

export async function getUserDuelChallenges(uid) {
  try {
    if (!uid) {
      return {
        success: false,
        message: "User ID is required",
        code: 400,
      };
    }

    const duelsRef = collection(db, "duels");
    const [asChallengerSnapshot, asOpponentSnapshot] = await Promise.all([
      getDocs(query(duelsRef, where("challengerId", "==", uid))),
      getDocs(query(duelsRef, where("opponentId", "==", uid))),
    ]);

    const duelMap = new Map();

    asChallengerSnapshot.forEach((duelDoc) => {
      duelMap.set(duelDoc.id, {
        duelId: duelDoc.id,
        ...duelDoc.data(),
      });
    });

    asOpponentSnapshot.forEach((duelDoc) => {
      duelMap.set(duelDoc.id, {
        duelId: duelDoc.id,
        ...duelDoc.data(),
      });
    });

    const duels = Array.from(duelMap.values()).sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0),
    );

    return {
      success: true,
      data: duels,
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching duel challenges:", error);
    return {
      success: false,
      message: "Failed to fetch challenges",
      code: 500,
    };
  }
}

export async function respondToDuelChallenge(duelId, uid, action) {
  try {
    if (!duelId || !uid || !["accept", "decline"].includes(action)) {
      return {
        success: false,
        message: "Invalid challenge response",
        code: 400,
      };
    }

    const duelRef = doc(db, "duels", duelId);
    const duelDoc = await getDoc(duelRef);

    if (!duelDoc.exists()) {
      return {
        success: false,
        message: "Challenge not found",
        code: 404,
      };
    }

    const duelData = duelDoc.data();
    if (duelData.opponentId !== uid) {
      return {
        success: false,
        message: "Only the invited friend can respond",
        code: 403,
      };
    }

    if (duelData.status !== "pending") {
      return {
        success: false,
        message: `Challenge is already ${duelData.status}`,
        code: 409,
      };
    }

    const now = new Date().toISOString();
    const updatePayload =
      action === "accept"
        ? {
            status: "active",
            acceptedAt: now,
            updatedAt: now,
          }
        : {
            status: "declined",
            declinedAt: now,
            updatedAt: now,
          };

    await setDoc(duelRef, updatePayload, { merge: true });

    return {
      success: true,
      message: `Challenge ${action}ed successfully`,
      code: 200,
    };
  } catch (error) {
    console.error("Error responding to duel challenge:", error);
    return {
      success: false,
      message: "Failed to respond to challenge",
      code: 500,
    };
  }
}

export async function cancelDuelChallenge(duelId, uid) {
  try {
    const duelRef = doc(db, "duels", duelId);
    const duelDoc = await getDoc(duelRef);

    if (!duelDoc.exists()) {
      return {
        success: false,
        message: "Challenge not found",
        code: 404,
      };
    }

    const duelData = duelDoc.data();
    if (duelData.challengerId !== uid) {
      return {
        success: false,
        message: "Only challenger can cancel this challenge",
        code: 403,
      };
    }

    if (duelData.status !== "pending") {
      return {
        success: false,
        message: "Only pending challenges can be cancelled",
        code: 409,
      };
    }

    await setDoc(
      duelRef,
      {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return {
      success: true,
      message: "Challenge cancelled",
      code: 200,
    };
  } catch (error) {
    console.error("Error cancelling challenge:", error);
    return {
      success: false,
      message: "Failed to cancel challenge",
      code: 500,
    };
  }
}

export async function submitDuelAttempt(duelId, uid, result) {
  try {
    const duelRef = doc(db, "duels", duelId);
    const duelDoc = await getDoc(duelRef);

    if (!duelDoc.exists()) {
      return {
        success: false,
        message: "Challenge not found",
        code: 404,
      };
    }

    const duelData = duelDoc.data();
    const isParticipant =
      uid === duelData.challengerId || uid === duelData.opponentId;
    if (!isParticipant) {
      return {
        success: false,
        message: "Unauthorized challenge access",
        code: 403,
      };
    }

    if (duelData.status !== "active") {
      return {
        success: false,
        message: "Challenge is not active",
        code: 409,
      };
    }

    const attempts = { ...(duelData.attempts || {}) };
    if (attempts[uid]) {
      return {
        success: false,
        message: "Attempt already submitted",
        code: 409,
      };
    }

    attempts[uid] = createDuelAttemptSummary(result);

    const now = new Date().toISOString();
    const updatePayload = {
      attempts,
      updatedAt: now,
    };

    const challengerAttempt = attempts[duelData.challengerId];
    const opponentAttempt = attempts[duelData.opponentId];

    if (challengerAttempt && opponentAttempt) {
      const winner = decideDuelWinner(
        duelData.challengerId,
        duelData.opponentId,
        challengerAttempt,
        opponentAttempt,
      );

      updatePayload.status = "completed";
      updatePayload.completedAt = now;
      updatePayload.winnerId = winner.winnerId;
      updatePayload.isDraw = winner.isDraw;
    }

    await setDoc(duelRef, updatePayload, { merge: true });

    return {
      success: true,
      data: {
        ...duelData,
        ...updatePayload,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error submitting duel attempt:", error);
    return {
      success: false,
      message: "Failed to submit duel attempt",
      code: 500,
    };
  }
}

function getDuelOutcomeForUser(duel, uid) {
  if (duel.status !== "completed") return null;
  if (duel.isDraw) return "draw";
  return duel.winnerId === uid ? "win" : "loss";
}

function computeWinStreakMetrics(sortedResults) {
  let bestWinStreak = 0;
  let runningWinStreak = 0;

  sortedResults.forEach((result) => {
    if (result.outcome === "win") {
      runningWinStreak += 1;
      bestWinStreak = Math.max(bestWinStreak, runningWinStreak);
    } else {
      runningWinStreak = 0;
    }
  });

  let currentWinStreak = 0;
  for (let index = sortedResults.length - 1; index >= 0; index -= 1) {
    if (sortedResults[index].outcome === "win") {
      currentWinStreak += 1;
    } else {
      break;
    }
  }

  return {
    currentWinStreak,
    bestWinStreak,
  };
}

function getOrCreateDuelStatsEntry(statsMap, payload) {
  const existing = statsMap.get(payload.uid);
  if (existing) {
    if (payload.displayName && payload.displayName !== "Anonymous User") {
      existing.displayName = payload.displayName;
    }
    if (payload.photoURL) {
      existing.photoURL = payload.photoURL;
    }
    if (payload.email) {
      existing.email = payload.email;
    }
    return existing;
  }

  const entry = {
    uid: payload.uid,
    displayName: payload.displayName || "Anonymous User",
    email: payload.email || "",
    photoURL: payload.photoURL || null,
    totalDuels: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalScore: 0,
    attemptsCount: 0,
    averageScore: 0,
    points: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    recentResults: [],
  };

  statsMap.set(payload.uid, entry);
  return entry;
}

export async function getDuelLeaderboard(currentUid, limit = 20) {
  try {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const completedDuelsQuery = query(
      collection(db, "duels"),
      where("status", "==", "completed"),
    );

    const snapshot = await getDocs(completedDuelsQuery);
    const statsMap = new Map();

    snapshot.forEach((duelDoc) => {
      const duel = duelDoc.data();
      const completedAt =
        duel.completedAt ||
        duel.updatedAt ||
        duel.createdAt ||
        new Date().toISOString();

      const challengerAttempt = duel?.attempts?.[duel.challengerId] || null;
      const opponentAttempt = duel?.attempts?.[duel.opponentId] || null;

      const challengerEntry = getOrCreateDuelStatsEntry(statsMap, {
        uid: duel.challengerId,
        displayName: duel.challengerName,
        email: duel.challengerEmail,
        photoURL: duel.challengerPhotoURL || null,
      });

      const opponentEntry = getOrCreateDuelStatsEntry(statsMap, {
        uid: duel.opponentId,
        displayName: duel.opponentName,
        email: duel.opponentEmail,
        photoURL: duel.opponentPhotoURL || null,
      });

      const challengerOutcome = getDuelOutcomeForUser(duel, duel.challengerId);
      const opponentOutcome = getDuelOutcomeForUser(duel, duel.opponentId);

      const participants = [
        {
          entry: challengerEntry,
          attempt: challengerAttempt,
          outcome: challengerOutcome,
          opponentName: duel.opponentName || "Opponent",
          opponentId: duel.opponentId,
        },
        {
          entry: opponentEntry,
          attempt: opponentAttempt,
          outcome: opponentOutcome,
          opponentName: duel.challengerName || "Opponent",
          opponentId: duel.challengerId,
        },
      ];

      participants.forEach((participant) => {
        if (!participant.outcome) return;

        participant.entry.totalDuels += 1;
        if (participant.outcome === "win") participant.entry.wins += 1;
        if (participant.outcome === "loss") participant.entry.losses += 1;
        if (participant.outcome === "draw") participant.entry.draws += 1;

        if (participant.attempt) {
          participant.entry.totalScore +=
            Number(participant.attempt.score) || 0;
          participant.entry.attemptsCount += 1;
        }

        participant.entry.recentResults.push({
          duelId: duel.duelId || duelDoc.id,
          outcome: participant.outcome,
          score: participant.attempt?.score ?? null,
          completedAt,
          opponentName: participant.opponentName,
          opponentId: participant.opponentId,
          courseTitle: duel?.course?.title || "Duel Course",
        });
      });
    });

    const rankedStats = Array.from(statsMap.values())
      .map((entry) => {
        const sortedResults = [...entry.recentResults].sort(
          (a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0),
        );

        const streaks = computeWinStreakMetrics(sortedResults);
        const averageScore =
          entry.attemptsCount > 0
            ? Number((entry.totalScore / entry.attemptsCount).toFixed(1))
            : 0;

        const winRate =
          entry.totalDuels > 0
            ? Number(((entry.wins / entry.totalDuels) * 100).toFixed(1))
            : 0;

        const points = entry.wins * 3 + entry.draws;

        return {
          ...entry,
          averageScore,
          winRate,
          points,
          currentWinStreak: streaks.currentWinStreak,
          bestWinStreak: streaks.bestWinStreak,
          recentResults: sortedResults.sort(
            (a, b) =>
              new Date(b.completedAt || 0) - new Date(a.completedAt || 0),
          ),
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.currentWinStreak !== a.currentWinStreak)
          return b.currentWinStreak - a.currentWinStreak;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.averageScore - a.averageScore;
      });

    const leaderboard = rankedStats.slice(0, safeLimit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const currentUserStats = rankedStats.find(
      (entry) => entry.uid === currentUid,
    ) || {
      uid: currentUid,
      displayName: "You",
      totalDuels: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      averageScore: 0,
      winRate: 0,
      points: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      recentResults: [],
      rank: null,
    };

    if (currentUserStats.rank == null) {
      const foundIndex = rankedStats.findIndex(
        (entry) => entry.uid === currentUid,
      );
      if (foundIndex >= 0) {
        currentUserStats.rank = foundIndex + 1;
      }
    }

    return {
      success: true,
      data: {
        leaderboard,
        currentUserStats,
        totalPlayers: rankedStats.length,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error getting duel leaderboard:", error);
    return {
      success: false,
      message: "Failed to fetch duel leaderboard",
      code: 500,
    };
  }
}

// ==================== FLASHCARD FUNCTIONS ====================

function getDefaultFlashcardCard(card = {}, index = 0) {
  const now = new Date().toISOString();
  return {
    id: card.id || generateUniqueId(`card_${index}_`),
    front: String(card.front || "").trim(),
    back: String(card.back || "").trim(),
    tags: Array.isArray(card.tags)
      ? card.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
          .slice(0, 5)
      : [],
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    dueDate: now,
    lastReviewedAt: null,
    reviewHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

function applySpacedRepetition(card, rating) {
  const quality = Math.max(0, Math.min(5, Number(rating) || 0));

  let repetitions = Number(card.repetitions) || 0;
  let interval = Number(card.interval) || 0;
  let easeFactor = Number(card.easeFactor) || 2.5;
  let lapses = Number(card.lapses) || 0;

  if (quality < 3) {
    repetitions = 0;
    interval = 0;
    lapses += 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor));
    }

    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );

    if (quality === 5) {
      interval = Math.max(1, Math.round(interval * 1.2));
    }

    if (quality === 3) {
      interval = Math.max(1, Math.round(interval * 0.8));
    }
  }

  const now = new Date();
  const dueDate =
    interval === 0
      ? new Date(now.getTime() + 10 * 60 * 1000)
      : new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    lapses,
    dueDate: dueDate.toISOString(),
    lastReviewedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    reviewHistoryEntry: {
      quality,
      reviewedAt: now.toISOString(),
      interval,
      easeFactor: Number(easeFactor.toFixed(2)),
    },
  };
}

export async function createFlashcardDeck(uid, deckData) {
  try {
    const { title, chatId = null, cards = [], source = "ai" } = deckData || {};

    if (!uid) {
      return {
        success: false,
        message: "User ID is required",
        code: 400,
      };
    }

    const normalizedCards = cards
      .map((card, index) => getDefaultFlashcardCard(card, index))
      .filter((card) => card.front && card.back);

    if (normalizedCards.length === 0) {
      return {
        success: false,
        message: "No valid flashcards to save",
        code: 400,
      };
    }

    const deckId = generateUniqueId("deck_");
    const now = new Date().toISOString();

    const payload = {
      deckId,
      userId: uid,
      title: String(title || "Untitled Deck").trim(),
      chatId,
      source,
      cards: normalizedCards,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "flashcardDecks", deckId), payload);

    return {
      success: true,
      data: payload,
      code: 200,
    };
  } catch (error) {
    console.error("Error creating flashcard deck:", error);
    return {
      success: false,
      message: "Failed to create flashcard deck",
      code: 500,
    };
  }
}

export async function getUserFlashcardDecks(uid) {
  try {
    if (!uid) {
      return {
        success: false,
        message: "User ID is required",
        code: 400,
      };
    }

    const deckQuery = query(
      collection(db, "flashcardDecks"),
      where("userId", "==", uid),
    );
    const snapshot = await getDocs(deckQuery);
    const now = Date.now();

    const decks = [];
    snapshot.forEach((deckDoc) => {
      const deck = deckDoc.data();
      const cards = Array.isArray(deck.cards) ? deck.cards : [];
      const dueCount = cards.filter(
        (card) => !card?.dueDate || new Date(card.dueDate).getTime() <= now,
      ).length;

      decks.push({
        deckId: deckDoc.id,
        ...deck,
        totalCards: cards.length,
        dueCount,
      });
    });

    decks.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0),
    );

    return {
      success: true,
      data: decks,
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching flashcard decks:", error);
    return {
      success: false,
      message: "Failed to fetch flashcard decks",
      code: 500,
    };
  }
}

export async function getFlashcardDeck(deckId, uid) {
  try {
    const deckRef = doc(db, "flashcardDecks", deckId);
    const deckDoc = await getDoc(deckRef);

    if (!deckDoc.exists()) {
      return {
        success: false,
        message: "Deck not found",
        code: 404,
      };
    }

    const deckData = deckDoc.data();
    if (deckData.userId !== uid) {
      return {
        success: false,
        message: "Unauthorized access",
        code: 403,
      };
    }

    return {
      success: true,
      data: {
        deckId: deckDoc.id,
        ...deckData,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching flashcard deck:", error);
    return {
      success: false,
      message: "Failed to fetch flashcard deck",
      code: 500,
    };
  }
}

export async function reviewFlashcard(deckId, uid, cardId, rating) {
  try {
    const deckRef = doc(db, "flashcardDecks", deckId);
    const deckDoc = await getDoc(deckRef);

    if (!deckDoc.exists()) {
      return {
        success: false,
        message: "Deck not found",
        code: 404,
      };
    }

    const deckData = deckDoc.data();
    if (deckData.userId !== uid) {
      return {
        success: false,
        message: "Unauthorized access",
        code: 403,
      };
    }

    const cards = Array.isArray(deckData.cards) ? [...deckData.cards] : [];
    const targetIndex = cards.findIndex((card) => card.id === cardId);

    if (targetIndex === -1) {
      return {
        success: false,
        message: "Card not found",
        code: 404,
      };
    }

    const schedule = applySpacedRepetition(cards[targetIndex], rating);
    const reviewHistory = Array.isArray(cards[targetIndex].reviewHistory)
      ? [
          ...cards[targetIndex].reviewHistory,
          schedule.reviewHistoryEntry,
        ].slice(-20)
      : [schedule.reviewHistoryEntry];

    cards[targetIndex] = {
      ...cards[targetIndex],
      repetitions: schedule.repetitions,
      interval: schedule.interval,
      easeFactor: schedule.easeFactor,
      lapses: schedule.lapses,
      dueDate: schedule.dueDate,
      lastReviewedAt: schedule.lastReviewedAt,
      updatedAt: schedule.updatedAt,
      reviewHistory,
    };

    await setDoc(
      deckRef,
      {
        cards,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return {
      success: true,
      data: cards[targetIndex],
      code: 200,
    };
  } catch (error) {
    console.error("Error reviewing flashcard:", error);
    return {
      success: false,
      message: "Failed to review flashcard",
      code: 500,
    };
  }
}
