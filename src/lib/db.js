export async function setResponseDB(response, uid) {
  try {
    const responseRef = doc(db, "response", uid);
    await setDoc(responseRef, response);
    return {success: true};
  } catch (error) {
    console.error("Error setting response in Firestore:", error);
    return {success: false, error: error.message};
  }
}
