"use client";

export default function CustomScrollbar() {
  return (
    <style jsx global>{`
      ::-webkit-scrollbar {
        width: 2px;
        height: 2px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(100, 100, 100, 0.3);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 100, 100, 0.3) transparent;
    `}</style>
  );
}