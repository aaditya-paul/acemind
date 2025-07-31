import React from "react";
import Sidebar from "./Sidebar";
import StudyFormContent from "./StudyFormContent";

function Home() {
  return (
    <Sidebar>
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 h-full pt-16 lg:pt-4">
        <StudyFormContent />
      </main>
    </Sidebar>
  );
}

export default Home;
