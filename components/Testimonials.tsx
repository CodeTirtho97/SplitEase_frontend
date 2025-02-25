"use client";
import { useEffect, useState } from "react";

const testimonials = [
  {
    text: "SplitEase makes splitting expenses effortless! Love it!",
    author: "Aakash Sharma",
  },
  {
    text: "Best app for trips with friends! No more manual calculations.",
    author: "Riya Patel",
  },
  {
    text: "Splitting expenses has never been easier! This app is a lifesaver.",
    author: "Ankit Verma",
  },
  {
    text: "A must-have for roommates! No more confusion over shared expenses.",
    author: "Priya Sharma",
  },
  {
    text: "Perfect for managing group outings! Quick, easy, and hassle-free.",
    author: "Saurav Mehta",
  },
  {
    text: "Finally, an app that makes splitting bills stress-free! Love it.",
    author: "Neha Kapoor",
  },
  {
    text: "No more awkward money conversations. This app does it all!",
    author: "Rahul Nair",
  },
  {
    text: "Super intuitive and easy to use! Highly recommended for travelers.",
    author: "Sneha Iyer",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="testimonials"
      className="mt-72 mb-36 max-w-6xl mx-auto text-center"
    >
      <h2 className="text-6xl font-extrabold text-gray-900 text-center tracking-tight mb-8">
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          What Our Users Say?
        </span>
      </h2>

      <div className="relative mt-6 overflow-hidden w-full">
        {/* Testimonial Slide */}
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full flex justify-center"
            >
              <div className="bg-gray-100 p-12 rounded-3xl shadow-lg w-3/4">
                <p className="italic text-xl">“{testimonial.text}”</p>
                <h4 className="text-xl font-bold mt-3">
                  – {testimonial.author}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Scrollbar */}
        <div className="mt-4 flex justify-center space-x-2">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-300"
              } transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
