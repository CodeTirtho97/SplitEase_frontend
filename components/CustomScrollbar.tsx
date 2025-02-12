"use client";
import { useState, useEffect } from "react";

export default function CustomScrollbar() {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  // Function to show scrollbar temporarily on scroll or mouse move
//   const handleVisibility = () => {
//     setIsVisible(true);
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => setIsVisible(false), 1500); // Hide after 1.5s
//   };

//   useEffect(() => {
//     document.addEventListener("scroll", handleVisibility);
//     document.addEventListener("mousemove", handleVisibility);

//     return () => {
//       document.removeEventListener("scroll", handleVisibility);
//       document.removeEventListener("mousemove", handleVisibility);
//     };
//   }, []);

  return (
    <style jsx global>{`
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: ${isVisible ? "6px" : "2px"}; /* Almost invisible when idle */
        height: ${isVisible ? "6px" : "2px"};
        transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(100, 100, 100, 0.3); /* Subtle color */
        border-radius: 10px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      /* Hide default scrollbar for Firefox */
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 100, 100, 0.3) transparent;
    `}</style>
  );
}