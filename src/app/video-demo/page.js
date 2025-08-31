"use client";

import React, {useState} from "react";
import VideoPlayer from "../../components/VideoPlayer";

export default function VideoDemoPage() {
  const [currentVideo, setCurrentVideo] = useState(0);

  // Sample video data - you can replace these with actual video URLs
  const sampleVideos = [
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      title: "Big Buck Bunny - Sample Video",
      poster:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    },
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      title: "Elephant's Dream - Creative Commons",
      poster:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    },
    {
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      title: "For Bigger Blazes - Sample Video",
      poster:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            VideoPlayer Component Demo
          </h1>
          <p className="text-gray-400 text-lg">
            A comprehensive video player with custom controls and fullscreen
            support
          </p>
        </div>

        {/* Video Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select a Video:</h2>
          <div className="flex flex-wrap gap-3">
            {sampleVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideo(index)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentVideo === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Video {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Video Player */}
        <div className="mb-12">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Main Video Player</h3>
            <VideoPlayer
              src={sampleVideos[currentVideo].src}
              title={sampleVideos[currentVideo].title}
              poster={sampleVideos[currentVideo].poster}
              className="w-full max-w-4xl mx-auto"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Compact Player */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Compact Player</h3>
            <VideoPlayer
              src={sampleVideos[1].src}
              title="Compact Video Player"
              poster={sampleVideos[1].poster}
              className="w-full aspect-video"
            />
          </div>

          {/* Auto-play Muted Player */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Auto-play (Muted)</h3>
            <VideoPlayer
              src={sampleVideos[2].src}
              title="Auto-play Demo"
              poster={sampleVideos[2].poster}
              autoPlay={true}
              muted={true}
              loop={true}
              className="w-full aspect-video"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-2xl font-semibold mb-6">VideoPlayer Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Play/Pause controls</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Volume control with mute</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Progress bar seeking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fullscreen support</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Keyboard shortcuts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Playback speed control</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Skip forward/backward (10s)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Auto-hide controls</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Loading states</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">Keyboard Shortcuts:</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div>
                <kbd className="bg-gray-600 px-2 py-1 rounded">Space</kbd> -
                Play/Pause
              </div>
              <div>
                <kbd className="bg-gray-600 px-2 py-1 rounded">←/→</kbd> - Skip
                10s
              </div>
              <div>
                <kbd className="bg-gray-600 px-2 py-1 rounded">↑/↓</kbd> -
                Volume
              </div>
              <div>
                <kbd className="bg-gray-600 px-2 py-1 rounded">M</kbd> -
                Mute/Unmute
              </div>
              <div>
                <kbd className="bg-gray-600 px-2 py-1 rounded">F</kbd> -
                Fullscreen
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="text-2xl font-semibold mb-4">Usage Example</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-green-400">{`import VideoPlayer from './components/VideoPlayer';

function MyComponent() {
  return (
    <VideoPlayer
      src="path/to/your/video.mp4"
      title="My Video Title"
      poster="path/to/poster.jpg"
      autoPlay={false}
      loop={false}
      muted={false}
      className="w-full aspect-video"
      onTimeUpdate={(time) => console.log('Current time:', time)}
      onLoadedMetadata={(duration) => console.log('Duration:', duration)}
      onEnded={() => console.log('Video ended')}
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
