"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Enhanced testimonials with ratings and avatars
const testimonials = [
  {
    text: "SplitEase makes splitting expenses effortless! Love it!",
    author: "Aakash Sharma",
    role: "Frequent Traveler",
    rating: 5,
    avatar: "A",
  },
  {
    text: "Best app for trips with friends! No more manual calculations.",
    author: "Riya Patel",
    role: "College Student",
    rating: 5,
    avatar: "R",
  },
  {
    text: "Splitting expenses has never been easier! This app is a lifesaver.",
    author: "Ankit Verma",
    role: "Project Manager",
    rating: 5,
    avatar: "A",
  },
  {
    text: "A must-have for roommates! No more confusion over shared expenses.",
    author: "Priya Sharma",
    role: "Roommate",
    rating: 4,
    avatar: "P",
  },
  {
    text: "Perfect for managing group outings! Quick, easy, and hassle-free.",
    author: "Saurav Mehta",
    role: "Team Lead",
    rating: 5,
    avatar: "S",
  },
  {
    text: "Finally, an app that makes splitting bills stress-free! Love it.",
    author: "Neha Kapoor",
    role: "Restaurant Owner",
    rating: 5,
    avatar: "N",
  },
  {
    text: "No more awkward money conversations. This app does it all!",
    author: "Rahul Nair",
    role: "Software Engineer",
    rating: 4,
    avatar: "R",
  },
  {
    text: "Super intuitive and easy to use! Highly recommended for travelers.",
    author: "Sneha Iyer",
    role: "Travel Blogger",
    rating: 5,
    avatar: "S",
  },
];

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [autoplay]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false); // Pause autoplay when user interacts

    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  return (
    <div id="testimonials" className="py-16 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 inline-block mb-3">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              What Our Users Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied users who are simplifying their group
            expenses
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hidden md:block"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hidden md:block"
            aria-label="Next testimonial"
          >
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Testimonials Slider */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-full px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: currentIndex === index ? 1 : 0.5,
                      y: 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {testimonial.author}
                        </h4>
                        <p className="text-gray-600">{testimonial.role}</p>
                      </div>
                      <div className="ml-auto">
                        <StarRating rating={testimonial.rating} />
                      </div>
                    </div>
                    <blockquote>
                      <p className="text-xl font-medium text-gray-800 italic mb-4">
                        "{testimonial.text}"
                      </p>
                    </blockquote>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Scrollbar/Pagination */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
