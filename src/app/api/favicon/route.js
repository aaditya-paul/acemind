import {ImageResponse} from "next/og";

export const runtime = "edge";

export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);
    const size = searchParams.get("size") || "32";
    const iconSize = parseInt(size);
    const emojiSize = Math.floor(iconSize * 0.6);

    return new ImageResponse(
      (
        <div
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
            borderRadius: `${iconSize * 0.2}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${emojiSize}px`,
          }}
        >
          🧠
        </div>
      ),
      {
        width: iconSize,
        height: iconSize,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
