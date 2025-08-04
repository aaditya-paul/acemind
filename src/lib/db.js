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

    // set in 'chats' collection in Firestore
    await setDoc(
      doc(db, "chats", chat_id),
      {
        topic: response.topic,
        syllabus: response.syllabus,
        aiResponse: response.aiResponse,
        timestamp: new Date().toISOString(),
        userId: uid,
        chatId: chat_id,
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
    return {success: true, data: chatData, code: 200};
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
