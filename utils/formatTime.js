// Function to format time ago
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Unknown time";

  const now = Date.now();
  const chatTime = new Date(timestamp).getTime();
  const diffInMs = now - chatTime;

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
};

export function formatDate(timestamp) {
  if (!timestamp) return "Unknown date";

  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(timestamp) {
  if (!timestamp) return "Unknown time";

  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
