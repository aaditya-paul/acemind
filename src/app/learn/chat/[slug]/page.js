"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import {useAuth} from "@/contexts/AuthContext";
import {getSingleChat} from "@/lib/db";
import {usePathname, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

function Page() {
  const slug = usePathname().slice(12); // Extract slug from path
  const router = useRouter();
  const {user, userData} = useAuth();
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(403);
  useEffect(() => {
    const fetchChat = async () => {
      const res = await getSingleChat(slug, user?.uid);
      if (res.success) {
        // Handle successful chat retrieval
        console.log("Chat data:", res.data);
      } else {
        // Handle error in chat retrieval
        console.error("Error fetching chat:", res.message);
        setError(res.message);
        setErrorCode(res.code);
        // router.push("/learn");
      }
    };
    fetchChat();
  }, [router, slug, user]);
  if (errorCode === 403) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
      </div>
    );
  }

  return <div>Page </div>;
}

export default Page;
