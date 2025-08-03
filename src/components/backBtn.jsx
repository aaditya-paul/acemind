"use client";
import {CircleChevronLeft} from "lucide-react";
import {useRouter} from "next/navigation";
import React from "react";

function BackBtn() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.back();
      }}
      className="  hover:text-yellow-300 cursor-pointer"
    >
      <CircleChevronLeft size={36} />
    </div>
  );
}

export default BackBtn;
