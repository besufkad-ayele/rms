"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Star,
  ExternalLink,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getReviewsData,
  resolveComplaintAction,
  MockStaffRankItem,
  MockDetailedFeedbackItem,
} from "./actions";

export default function AdminReviewsPage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"leaderboard" | "feedbacks" | "triage">("leaderboard");
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getReviewsData();
    setReviewsData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = (fbId: string) => {
    startTransition(async () => {
      const res = await resolveComplaintAction(fbId);
      if (res.success) {
        showToast("Internal complaint marked as resolved by manager.");
        loadData();
      }
    });
  };

  if (!reviewsData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const { summary, leaderboard, feedbacks } = reviewsData;

  const unresolvedFeedbacks = feedbacks.filter((f: MockDetailedFeedbackItem) => !f.resolved || f.weightedScore < 4.0);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <Star className="h-3 w-3 fill-brand-accent" />
              Module 04: Reputation &amp; Feedback Engine
            </span>
            <span className="text-[12px] text-brand-secondary">
              • 5-Factor Weighted Ratings &amp; Google Review Redirect Funnel
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Staff Scorecards &amp; Customer Reputation Hub
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Capture post-settlement dining feedback, compute rolling weighted staff performance, and funnel 5-star reviews directly to Google Business.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh Ratings"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Rolling Avg */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Average Rating
            </p>
            <p className="font-header text-2xl font-bold text-status-occupied mt-1">
              ★ {summary.avgWeightedScore} / 5.0
            </p>
          </div>
          <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied">
            <Star className="h-5 w-5 fill-status-occupied" />
          </div>
        </div>

        {/* KPI 2: Total Verified */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Total Ratings Logged
            </p>
            <p className="font-header text-2xl font-bold text-brand-heading mt-1">
              {summary.totalReviews} Reviews
            </p>
          </div>
          <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary">
            <MessageSquare className="h-5 w-5 text-brand-accent" />
          </div>
        </div>

        {/* KPI 3: Google Funnel */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Google Review Funnel
            </p>
            <p className="font-header text-2xl font-bold text-status-free mt-1">
              {summary.googleConversionPercent}%
            </p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <ExternalLink className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Top Attendants */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Top Ranked Attendants
            </p>
            <p className="font-header text-2xl font-bold text-brand-primary mt-1">
              {leaderboard.length} On Duty
            </p>
          </div>
          <div className="rounded-xl bg-brand-accent/10 p-2.5 text-brand-accent">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-2">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "leaderboard"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
          )}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Staff Leaderboard</span>
          <span className="rounded-pill bg-white/20 px-1.5 py-0.2 text-[10px]">
            {leaderboard.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("feedbacks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "feedbacks"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>5-Factor Customer Reviews Stream</span>
          <span className="rounded-pill bg-bg-card px-1.5 py-0.2 text-[10px] text-brand-secondary">
            {feedbacks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("triage")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "triage"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-status-occupied" />
          <span>Internal Complaints Triage</span>
          <span className="rounded-pill bg-status-occupied-bg px-1.5 py-0.2 text-[10px] text-status-occupied font-bold">
            {unresolvedFeedbacks.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Staff Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Rank &amp; Attendant</th>
                  <th className="pb-3">Role / Station</th>
                  <th className="pb-3">Rolling Average</th>
                  <th className="pb-3">Friendliness (25%)</th>
                  <th className="pb-3">Accuracy &amp; Speed (25%)</th>
                  <th className="pb-3">Reviews Count</th>
                  <th className="pb-3 pr-2 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {leaderboard.map((stf: MockStaffRankItem, idx: number) => (
                  <tr key={stf.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3.5 pl-2 font-bold text-brand-primary">
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-pill bg-bg-card text-brand-primary font-bold flex items-center justify-center text-[11px] border border-divider">
                          #{idx + 1}
                        </span>
                        <span>{stf.staffName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-brand-secondary">
                      {stf.role}
                    </td>

                    <td className="py-3.5 font-bold font-header text-sm text-status-occupied">
                      ★ {stf.ratingAverage} / 5.0
                    </td>

                    <td className="py-3.5 font-semibold text-brand-primary">
                      {stf.friendlinessScore} / 5.0
                    </td>

                    <td className="py-3.5 font-semibold text-brand-primary">
                      {stf.speedScore} / 5.0
                    </td>

                    <td className="py-3.5 text-brand-secondary">
                      {stf.totalReviews} ratings
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <span className="rounded-pill bg-status-free-bg px-2.5 py-0.5 text-[10px] font-bold text-status-free border border-status-free/20">
                        {stf.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Detailed 5-Factor Feedbacks */}
      {activeTab === "feedbacks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb: MockDetailedFeedbackItem) => (
            <div
              key={fb.id}
              className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-header font-bold text-base text-brand-heading">
                      Table {fb.tableCode}
                    </span>
                    <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-mono text-brand-secondary border border-divider">
                      {fb.orderNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-secondary mt-0.5">
                    Attendant: <strong className="text-brand-primary">{fb.staffName}</strong> • {fb.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-pill bg-status-occupied-bg px-2.5 py-1 text-xs font-bold text-status-occupied">
                  <Star className="h-3.5 w-3.5 fill-status-occupied" />
                  <span>{fb.weightedScore} / 5.0</span>
                </div>
              </div>

              {/* 5 Rating Dimension Bars */}
              <div className="space-y-1.5 pt-2 border-t border-divider text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-secondary">Attendant Friendliness (25%):</span>
                  <span className="font-bold text-brand-primary">{fb.staffRatingQ1} / 5 ★</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-secondary">Order Accuracy &amp; Speed (25%):</span>
                  <span className="font-bold text-brand-primary">{fb.staffRatingQ2} / 5 ★</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-secondary">Food Quality &amp; Taste (20%):</span>
                  <span className="font-bold text-brand-primary">{fb.foodRating} / 5 ★</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-secondary">Kitchen Delivery Speed (15%):</span>
                  <span className="font-bold text-brand-primary">{fb.speedRating} / 5 ★</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-secondary">Ambience &amp; Cleanliness (15%):</span>
                  <span className="font-bold text-brand-primary">{fb.ambienceRating} / 5 ★</span>
                </div>
              </div>

              {fb.comment && (
                <div className="rounded-card bg-bg-subtle p-3 border border-divider/60 text-xs italic text-brand-primary">
                  &ldquo;{fb.comment}&rdquo;
                </div>
              )}

              {/* Footer Badge */}
              <div className="pt-2 border-t border-divider flex items-center justify-between text-[11px]">
                {fb.redirectedToGoogle ? (
                  <span className="flex items-center gap-1 text-status-free font-bold">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Sent to Google Review
                  </span>
                ) : (
                  <span className="text-brand-secondary font-medium">
                    Internal Service Log
                  </span>
                )}
                <span className="text-brand-secondary">Verified Dine-in</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Internal Complaints Triage */}
      {activeTab === "triage" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div>
              <h3 className="font-header text-base font-bold text-brand-heading">
                Internal Service Recovery &amp; Complaint Triage
              </h3>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Reviews with scores below 4.0 are caught internally to prevent public negative Google ratings, allowing immediate managerial resolution.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {unresolvedFeedbacks.map((fb: MockDetailedFeedbackItem) => (
              <div
                key={fb.id}
                className="rounded-card p-4 border border-status-danger/30 bg-status-danger-bg/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-brand-primary">
                      Table {fb.tableCode} (Attendant: {fb.staffName})
                    </span>
                    <p className="text-xs text-brand-secondary mt-0.5">{fb.createdAt}</p>
                  </div>

                  <span className="rounded-pill bg-status-danger text-white px-2.5 py-0.5 text-xs font-bold">
                    Score: {fb.weightedScore} / 5.0
                  </span>
                </div>

                {fb.comment && (
                  <p className="text-xs text-brand-primary italic bg-white p-3 rounded-card border border-divider">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-brand-secondary">
                    Status: {fb.resolved ? "Resolved" : "Awaiting Manager Contact"}
                  </span>
                  {!fb.resolved && (
                    <button
                      onClick={() => handleResolve(fb.id)}
                      className="rounded-button bg-status-free px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
