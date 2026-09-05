"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, MessageSquare, ExternalLink, Sparkles, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { cn } from "@/lib/utils";

export interface RatingFeedbackData {
  staffFriendliness: number;
  staffPromptness: number;
  foodRating: number;
  ambienceRating: number;
  comment: string;
  tableCode: string;
  redirectedToGoogle?: boolean;
}

interface RatingStepProps {
  serverName: string;
  tableCode: string;
  onSubmitRating?: (feedback: RatingFeedbackData) => Promise<void> | void;
  onReturnHome?: () => void;
}

export function RatingStep({
  serverName = "Michael Tadesse",
  tableCode,
  onSubmitRating,
  onReturnHome,
}: RatingStepProps) {
  const router = useRouter();
  const [staffFriendliness, setStaffFriendliness] = useState<number>(5);
  const [staffPromptness, setStaffPromptness] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [ambienceRating, setAmbienceRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const handleReturn = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitted && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSubmitted && redirectCountdown === 0) {
      handleReturn();
    }
    return () => clearTimeout(timer);
  }, [isSubmitted, redirectCountdown]);

  const handleSubmit = async () => {
    setIsSaving(true);
    const feedbackPayload: RatingFeedbackData = {
      staffFriendliness,
      staffPromptness,
      foodRating,
      ambienceRating,
      comment,
      tableCode,
      redirectedToGoogle: false,
    };
    if (onSubmitRating) {
      await onSubmitRating(feedbackPayload);
    }
    setIsSaving(false);
    setIsSubmitted(true);
  };

  const handleGoogleRedirect = async () => {
    // 1. Open Google Review link in new tab
    window.open(RESTAURANT_INFO.googleBusinessUrl, "_blank", "noopener,noreferrer");

    // 2. Notify parent of Google redirect and await completion
    if (onSubmitRating) {
      await onSubmitRating({
        staffFriendliness,
        staffPromptness,
        foodRating,
        ambienceRating,
        comment,
        tableCode,
        redirectedToGoogle: true,
      });
    }

    // 3. Return to actual landing page immediately
    handleReturn();
  };

  if (isSubmitted) {
    return (
      <div className="rounded-card border border-divider bg-white p-6 sm:p-8 shadow-card text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-available-bg text-status-available ring-8 ring-status-available-bg/50">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-header text-2xl font-bold text-brand-primary">
            Ameseginalehu! (Thank You!)
          </h3>
          <p className="text-sm text-brand-secondary leading-relaxed">
            Your feedback has been saved and delivered to {serverName} and the culinary team. We truly value your patronage at Keren Addis.
          </p>
        </div>

        {/* Google Review Prompt */}
        <div className="rounded-card bg-background-subtle p-5 border border-divider max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-brand-accent font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Support Our Local Craft</span>
          </div>
          <p className="text-xs text-brand-primary font-medium">
            Would you take 10 seconds to share your 5-star experience on Google Reviews?
          </p>
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleGoogleRedirect}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black active:scale-95"
            >
              <span>Review Keren Addis on Google</span>
              <ExternalLink className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleReturn}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-button bg-white border border-divider px-4 py-2.5 text-xs font-semibold text-brand-primary hover:bg-background-active transition"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Done &amp; Return to Home</span>
            </button>
          </div>
          {redirectCountdown > 0 && (
            <p className="text-[11px] text-brand-secondary">
              Returning to home page in {redirectCountdown}s...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-divider bg-white p-5 sm:p-6 shadow-card space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-pill bg-background-active px-3 py-1 text-xs font-semibold text-brand-accent mb-2">
          <Heart className="h-3.5 w-3.5" />
          <span>Guest Experience</span>
        </div>
        <h3 className="font-header text-xl font-bold text-brand-primary">
          How was your time at Table {tableCode.replace("T-", "")}?
        </h3>
        <p className="text-xs text-brand-secondary mt-1">
          Your feedback directly supports our service and kitchen staff.
        </p>
      </div>

      {/* Staff Ratings */}
      <div className="rounded-card bg-background-subtle p-4 border border-divider space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
          Staff Member: {serverName}
        </h4>

        {/* Question 1 */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-primary">
            Attentiveness & Warmth
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStaffFriendliness(star)}
                aria-label={`Rate ${star} out of 5 stars`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button bg-white border border-divider transition hover:border-brand-accent"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition",
                    star <= staffFriendliness
                      ? "fill-brand-accent text-brand-accent"
                      : "text-brand-muted"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-primary">
            Order Speed & Accuracy
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStaffPromptness(star)}
                aria-label={`Rate ${star} out of 5 stars`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button bg-white border border-divider transition hover:border-brand-accent"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition",
                    star <= staffPromptness
                      ? "fill-brand-accent text-brand-accent"
                      : "text-brand-muted"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Ratings */}
      <div className="rounded-card bg-background-subtle p-4 border border-divider space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
          Culinary & Ambience
        </h4>

        {/* Question 3: Food */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-primary">
            Food Flavor & Presentation
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFoodRating(star)}
                aria-label={`Rate food ${star} out of 5 stars`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button bg-white border border-divider transition hover:border-brand-accent"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition",
                    star <= foodRating
                      ? "fill-brand-accent text-brand-accent"
                      : "text-brand-muted"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Question 4: Ambience */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand-primary">
            Dining Vibe & Cleanliness
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setAmbienceRating(star)}
                aria-label={`Rate ambience ${star} out of 5 stars`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button bg-white border border-divider transition hover:border-brand-accent"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition",
                    star <= ambienceRating
                      ? "fill-brand-accent text-brand-accent"
                      : "text-brand-muted"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes / Comments */}
      <div>
        <label className="block text-xs font-semibold text-brand-primary mb-1.5">
          Additional Comments or Compliments (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you enjoyed most or what we can improve..."
          rows={3}
          className="w-full rounded-button border border-divider bg-white p-3 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-[0.99]"
      >
        <span>Submit Feedback</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
