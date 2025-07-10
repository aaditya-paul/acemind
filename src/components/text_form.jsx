"use client";
import React, {useState} from "react";

function Form() {
  const [topic, setTopic] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    if (!syllabus.trim()) {
      alert("Please enter the syllabus");
      return;
    }

    try {
      console.log("Sending data to backend...");
      // Get the current host and use it for the API URL
      const currentHost = window.location.hostname;
      const apiUrl = `http://${currentHost}:8000/api/submit`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          syllabus: syllabus,
        }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.success) {
        alert("Form submitted successfully!");
        // Clear the form
        // setTopic("");
        // setSyllabus("");
        setAiResponse(data.data.aiResponse);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            What do you want to study?
          </h1>
          <p className="text-gray-400">
            Enter your topic and syllabus to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium mb-2">
              Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Machine Learning, Data Structures, etc."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Syllabus Input */}
          <div>
            <label
              htmlFor="syllabus"
              className="block text-sm font-medium mb-2"
            >
              Syllabus
            </label>
            <textarea
              id="syllabus"
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Enter your syllabus content here..."
              rows="6"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
          >
            Start Learning
          </button>
        </form>
        {aiResponse && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">AI Response</h2>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(aiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Form;
