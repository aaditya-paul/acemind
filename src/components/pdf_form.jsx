"use client";
import React, {useState} from "react";

function Form() {
  const [topic, setTopic] = useState("");
  const [syllabusPdf, setSyllabusPdf] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSyllabusPdf(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSyllabusPdf(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    if (!syllabusPdf) {
      alert("Please upload a syllabus PDF");
      return;
    }

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("syllabus", syllabusPdf);

      const response = await fetch("http://localhost:8000/api/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
        alert("Form submitted successfully!");
        // Reset form after successful submission
        setTopic("");
        setSyllabusPdf(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(response.status);
      console.log(response.message);
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
            Enter your topic and upload your syllabus to get started
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

          {/* PDF Upload */}
          <div>
            <label
              htmlFor="syllabus"
              className="block text-sm font-medium mb-2"
            >
              Syllabus PDF
            </label>
            <div
              className={`w-full p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
                isDragOver
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 bg-gray-900/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="syllabus"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <label
                htmlFor="syllabus"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="mb-3">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                {syllabusPdf ? (
                  <div className="text-center">
                    <p className="text-green-400 font-medium">
                      ✓ {syllabusPdf.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 font-medium">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      PDF files only (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
}

export default Form;
