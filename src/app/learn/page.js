import Home from "@/components/home";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import React from "react";

function Page() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Home />
    </ProtectedRoute>
  );
}

export default Page;
