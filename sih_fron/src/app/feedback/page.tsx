// app/feedback/page.tsx
"use client";

import React, { useState } from "react";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      alert("⚠️ Please provide a rating and comment.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
        🌟 We Value Your Feedback
      </h1>

      <div className="w-full max-w-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 p-8">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform transform hover:scale-125 ${
                    rating >= star ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              rows={4}
            ></textarea>

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-110"
              >
                ✅ Submit Feedback
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-600">🎉 Thank you!</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your feedback helps us improve. We appreciate your time! 💜
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
