export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`;
}
