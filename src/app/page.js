"use client"

import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import MobileLandingPage from "@/components/MobileLandingPage";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this value based on your breakpoint
    };

    handleResize(); // Check initial size
    window.addEventListener("resize", handleResize); // Add resize listener

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener on unmount
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {isMobile ? (
        <MobileLandingPage />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}
