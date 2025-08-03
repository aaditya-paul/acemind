import {
  arrayUnion,
  collection,
  doc,
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
