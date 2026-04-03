"use client";

import React, { useState, useEffect } from "react";

interface FeedbackOverlayProps {
  /** Unique key to track whether feedback was already submitted (e.g. portal slug or property id) */
  itemId: string;
  itemType: "portal" | "property";
}

function StarIcon({ filled, half }: { filled: boolean; half: boolean }) {
  if (half) {
    return (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#c9a96e" />
            <stop offset="50%" stopColor="#2a2a2a" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfGrad)"
          stroke="#c9a96e"
          strokeWidth="0.5"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "#c9a96e" : "#2a2a2a"}
        stroke="#c9a96e"
        strokeWidth="0.5"
      />
    </svg>
  );
}

const INITIAL_DELAY = 60_000; // 1 minute
const SNOOZE_DELAY = 120_000; // 2 minutes

export function FeedbackOverlay({ itemId, itemType }: FeedbackOverlayProps) {
  const storageKey = `feedback-submitted-${itemType}-${itemId}`;
  const [alreadySubmitted, setAlreadySubmitted] = useState(true); // hide by default
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"rate" | "comment">("rate");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (done === "true") {
      setAlreadySubmitted(true);
      return;
    }
    setAlreadySubmitted(false);
    // Show after initial delay
    const timer = setTimeout(() => setVisible(true), INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const handleAskLater = () => {
    setVisible(false);
    // Reset form state so it's fresh when it reappears
    setRating(0);
    setHoverRating(0);
    setComment("");
    setStep("rate");
    setTimeout(() => setVisible(true), SNOOZE_DELAY);
  };

  if (alreadySubmitted || !visible) return null;

  const handleStarInteraction = (starIndex: number, isHalf: boolean) => {
    const value = isHalf ? starIndex + 0.5 : starIndex + 1;
    return value;
  };

  const handleStarClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const value = handleStarInteraction(starIndex, isHalf);
    setRating(value);
    // Move to comment step after a brief moment
    setTimeout(() => setStep("comment"), 400);
  };

  const handleStarHover = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(handleStarInteraction(starIndex, isHalf));
  };

  const displayRating = hoverRating || rating;

  const handleSubmit = async () => {
    if (!comment.trim() || !rating) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          rating,
          comment: comment.trim(),
        }),
      });
    } catch {
      // still mark as submitted locally
    }
    localStorage.setItem(storageKey, "true");
    setSubmitted(true);
    setTimeout(() => setAlreadySubmitted(true), 1800);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-dark-900/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-dark-800 border border-gold-400/20 rounded-2xl p-10 max-w-md w-full text-center animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-400/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
          <p className="text-dark-400 text-sm">Your feedback is invaluable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-dark-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-gold-400/20 rounded-2xl p-8 md:p-10 max-w-md w-full animate-fade-up">
        {/* Ask me later */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleAskLater}
            className="text-dark-500 hover:text-dark-300 text-xs transition-colors"
          >
            Ask me later
          </button>
        </div>

        {/* Step 1: Rating */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gold-400 mb-3">
            QUICK FEEDBACK
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            What&apos;s your first impression?
          </h2>
          <div className="gold-line mx-auto mb-6" />

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[0, 1, 2, 3, 4].map((starIndex) => {
              const starNumber = starIndex + 1;
              const isFull = displayRating >= starNumber;
              const isHalf = !isFull && displayRating >= starNumber - 0.5;
              return (
                <button
                  key={starIndex}
                  type="button"
                  className="w-10 h-10 md:w-12 md:h-12 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  onClick={(e) => handleStarClick(starIndex, e)}
                  onMouseMove={(e) => handleStarHover(starIndex, e)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${starNumber} star${starNumber > 1 ? "s" : ""}`}
                >
                  <StarIcon filled={isFull} half={isHalf} />
                </button>
              );
            })}
          </div>
          {rating > 0 && (
            <p className="text-gold-400 text-sm font-medium">{rating} / 5</p>
          )}
        </div>

        {/* Step 2: Comment (appears after rating) */}
        {step === "comment" && (
          <div className="animate-fade-up">
            <label className="block text-sm font-semibold text-white mb-2">
              What stands out and what&apos;s missing?
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600/40 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-400/50 transition-colors text-sm resize-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!comment.trim() || submitting}
              className="mt-4 w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gold-400 text-dark-900 hover:bg-gold-300 active:scale-[0.98]"
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
