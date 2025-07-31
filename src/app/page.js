// import Form from "@/components/pdf_form";
// import Form from "@/components/text_form";
import Home from "@/components/home";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

function Page() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Home />
    </ProtectedRoute>
  );
}

export default Page;
