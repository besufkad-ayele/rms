"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
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
  Heart,
  Utensils,
  Clock,
  Building,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getReviewsData,
  resolveComplaintAction,
  StaffPerformanceCard,
  DetailedReviewItem,
  ReviewsAnalyticsSummary,
} from "./actions";

export default function AdminReviewsPage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"feedbacks" | "leaderboard" | "triage">("feedbacks");
  const [data, setData] = useState<{
    summary: ReviewsAnalyticsSummary;
    leaderboard: StaffPerformanceCard[];
    feedbacks: DetailedReviewItem[];
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRating, setFilterRating] = useState<"all" | "5" | "4" | "critical" | "google">("all");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const res = await getReviewsData();
      setData(res);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (fbId: string) => {
    startTransition(async () => {
      const res = await resolveComplaintAction(fbId);
      if (res.success) {
        showToast("Service complaint logged as resolved by manager.");
        loadData();
      }
    });
  };

  const filteredFeedbacks = useMemo(() => {
    if (!data?.feedbacks) return [];
    return data.feedbacks.filter((fb) => {
      // Rating filter
      if (filterRating === "5" && fb.weightedScore < 4.8) return false;
      if (filterRating === "4" && (fb.weightedScore < 3.8 || fb.weightedScore >= 4.8)) return false;
      if (filterRating === "critical" && fb.weightedScore >= 3.8) return false;
      if (filterRating === "google" && !fb.redirectedToGoogle) return false;

      // Staff filter
      if (selectedStaffFilter !== "all" && fb.staffId !== selectedStaffFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTable = fb.tableCode.toLowerCase().includes(q);
        const matchesStaff = fb.staffName.toLowerCase().includes(q);
        const matchesOrder = fb.orderNumber.toLowerCase().includes(q);
        const matchesComment = fb.comment ? fb.comment.toLowerCase().includes(q) : false;
        return matchesTable || matchesStaff || matchesOrder || matchesComment;
      }

      return true;
    });
  }, [data?.feedbacks, filterRating, selectedStaffFilter, searchQuery]);

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
        <p className="text-xs text-brand-secondary font-medium">Loading reputation data...</p>
      </div>
    );
  }

  const { summary, leaderboard, feedbacks } = data;
  const unresolvedFeedbacks = feedbacks.filter((f) => !f.resolved || f.weightedScore < 4.0);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-available shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <Star className="h-3 w-3 fill-brand-accent" />
              Reputation &amp; Staff Intelligence
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Real-time 5-Factor Dining Reviews &amp; Google Funnel
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-primary tracking-tight">
            Customer Feedback &amp; Attendant Scorecards
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Verified post-settlement feedback directly tracking food quality, staff warmth, promptness, and Google Reviews conversion.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh Ratings"
            className="flex items-center gap-1.5 rounded-button bg-white px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-background-subtle transition shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Sync Live Ratings</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Overall Average */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overall Score</span>
            <Star className="h-4 w-4 fill-status-occupied text-status-occupied" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-brand-primary">★ {summary.avgWeightedScore}</span>
              <span className="text-xs text-brand-secondary">/ 5.0</span>
            </div>
            <p className="text-[10px] text-status-available font-semibold mt-0.5">Highland Standard</p>
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Feedback</span>
            <MessageSquare className="h-4 w-4 text-brand-accent" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-brand-primary">{summary.totalReviews}</span>
              <span className="text-xs text-brand-secondary">verified</span>
            </div>
            <p className="text-[10px] text-brand-secondary mt-0.5">100% Dine-in guests</p>
          </div>
        </div>

        {/* KPI 3: Google Conversion */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Google Funnel</span>
            <ExternalLink className="h-4 w-4 text-status-available" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-status-available">{summary.googleConversionPercent}%</span>
            </div>
            <p className="text-[10px] text-brand-secondary mt-0.5">{summary.redirectedToGoogleCount} sent to Google</p>
          </div>
        </div>

        {/* KPI 4: Food Quality */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Food Flavor</span>
            <Utensils className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-brand-primary">★ {summary.avgFoodScore}</span>
              <span className="text-xs text-brand-secondary">/ 5.0</span>
            </div>
            <p className="text-[10px] text-brand-secondary mt-0.5">20% Weight</p>
          </div>
        </div>

        {/* KPI 5: Staff Warmth */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Staff Warmth</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-brand-primary">★ {summary.avgFriendlinessScore}</span>
              <span className="text-xs text-brand-secondary">/ 5.0</span>
            </div>
            <p className="text-[10px] text-brand-secondary mt-0.5">25% Weight</p>
          </div>
        </div>

        {/* KPI 6: Speed & Accuracy */}
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-brand-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Order Speed</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-header text-2xl font-bold text-brand-primary">★ {summary.avgPromptnessScore}</span>
              <span className="text-xs text-brand-secondary">/ 5.0</span>
            </div>
            <p className="text-[10px] text-brand-secondary mt-0.5">25% Weight</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-2">
        <button
          onClick={() => setActiveTab("feedbacks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "feedbacks"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-background-subtle"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Detailed Customer Reviews</span>
          <span className={cn(
            "rounded-pill px-1.5 py-0.2 text-[10px]",
            activeTab === "feedbacks" ? "bg-white/20 text-white" : "bg-background-subtle text-brand-secondary"
          )}>
            {feedbacks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "leaderboard"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-background-subtle"
          )}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Staff Leaderboard &amp; Scores</span>
          <span className={cn(
            "rounded-pill px-1.5 py-0.2 text-[10px]",
            activeTab === "leaderboard" ? "bg-white/20 text-white" : "bg-background-subtle text-brand-secondary"
          )}>
            {leaderboard.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("triage")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "triage"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-background-subtle"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-status-occupied" />
          <span>Service Triage &amp; Recovery</span>
          <span className="rounded-pill bg-status-occupied/10 px-1.5 py-0.2 text-[10px] text-status-occupied font-bold">
            {unresolvedFeedbacks.length}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: Detailed Customer Reviews Feed */}
      {/* ============================================================ */}
      {activeTab === "feedbacks" && (
        <div className="space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-divider shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search table, attendant, comment, or order..."
                className="w-full rounded-button border border-divider bg-background-subtle pl-8 pr-3 py-1.5 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterRating("all")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-medium border transition",
                  filterRating === "all"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-background-subtle text-brand-secondary border-divider hover:text-brand-primary"
                )}
              >
                All ({feedbacks.length})
              </button>

              <button
                onClick={() => setFilterRating("5")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-medium border transition flex items-center gap-1",
                  filterRating === "5"
                    ? "bg-status-available text-white border-status-available"
                    : "bg-background-subtle text-brand-secondary border-divider hover:text-brand-primary"
                )}
              >
                <Star className="h-3 w-3 fill-current" />
                <span>5-Star ({summary.fiveStarCount})</span>
              </button>

              <button
                onClick={() => setFilterRating("google")}
                className={cn(
                  "px-2.5 py-1 rounded-pill font-medium border transition flex items-center gap-1",
                  filterRating === "google"
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-background-subtle text-brand-secondary border-divider hover:text-brand-primary"
                )}
              >
                <ExternalLink className="h-3 w-3" />
                <span>Google Review ({summary.redirectedToGoogleCount})</span>
              </button>

              {summary.criticalCount > 0 && (
                <button
                  onClick={() => setFilterRating("critical")}
                  className={cn(
                    "px-2.5 py-1 rounded-pill font-medium border transition flex items-center gap-1",
                    filterRating === "critical"
                      ? "bg-status-occupied text-white border-status-occupied"
                      : "bg-background-subtle text-brand-secondary border-divider hover:text-brand-primary"
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Critical ({summary.criticalCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4 hover:border-brand-accent/40 transition"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-header font-bold text-base text-brand-primary">
                        Table {fb.tableCode.replace("T-", "")}
                      </span>
                      <span className="rounded-pill bg-background-subtle px-2 py-0.5 text-[10px] font-mono text-brand-secondary border border-divider">
                        {fb.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-secondary mt-1">
                      <UserCheck className="h-3.5 w-3.5 text-brand-accent" />
                      <span>Attendant: <strong className="text-brand-primary">{fb.staffName}</strong></span>
                      <span>•</span>
                      <span>{fb.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-pill bg-status-occupied/10 px-3 py-1 text-xs font-bold text-status-occupied border border-status-occupied/20">
                    <Star className="h-3.5 w-3.5 fill-status-occupied" />
                    <span>★ {fb.weightedScore.toFixed(2)}</span>
                  </div>
                </div>

                {/* 5 Rating Dimension Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-divider text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-secondary flex items-center gap-1">
                      <Heart className="h-3 w-3 text-rose-500" />
                      Attendant Warmth &amp; Friendliness (25%):
                    </span>
                    <span className="font-bold text-brand-primary">{fb.staffRatingQ1} / 5 ★</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-secondary flex items-center gap-1">
                      <Clock className="h-3 w-3 text-sky-500" />
                      Order Speed &amp; Accuracy (25%):
                    </span>
                    <span className="font-bold text-brand-primary">{fb.staffRatingQ2} / 5 ★</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-secondary flex items-center gap-1">
                      <Utensils className="h-3 w-3 text-amber-500" />
                      Food Flavor &amp; Presentation (20%):
                    </span>
                    <span className="font-bold text-brand-primary">{fb.foodRating} / 5 ★</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-secondary flex items-center gap-1">
                      <Building className="h-3 w-3 text-emerald-500" />
                      Ambience &amp; Cleanliness (15%):
                    </span>
                    <span className="font-bold text-brand-primary">{fb.ambienceRating} / 5 ★</span>
                  </div>
                </div>

                {/* Customer Written Comment */}
                {fb.comment ? (
                  <div className="rounded-card bg-background-subtle p-3.5 border border-brand-accent/20 text-xs text-brand-primary leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                      <MessageSquare className="h-3 w-3" />
                      <span>Guest Comment</span>
                    </div>
                    <p className="italic font-medium text-brand-primary">
                      &ldquo;{fb.comment}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="rounded-card bg-background-subtle/40 p-2.5 border border-dashed border-divider text-[11px] text-brand-secondary italic">
                    No written note attached to this rating.
                  </div>
                )}

                {/* Footer Badges */}
                <div className="pt-2 border-t border-divider flex items-center justify-between text-[11px]">
                  {fb.redirectedToGoogle ? (
                    <span className="flex items-center gap-1 text-status-available font-bold">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Redirected to Google Review
                    </span>
                  ) : (
                    <span className="text-brand-secondary font-medium">
                      Internal Experience Log
                    </span>
                  )}
                  <span className="text-brand-secondary">Verified Dine-in</span>
                </div>
              </div>
            ))}
          </div>

          {filteredFeedbacks.length === 0 && (
            <div className="rounded-card bg-white p-12 border border-divider text-center space-y-2">
              <MessageSquare className="mx-auto h-8 w-8 text-brand-secondary opacity-40" />
              <p className="text-sm font-semibold text-brand-primary">No reviews matched your filters</p>
              <p className="text-xs text-brand-secondary">Try resetting your search query or rating filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: Staff Leaderboard & Scorecards */}
      {/* ============================================================ */}
      {activeTab === "leaderboard" && (
        <div className="space-y-5">
          <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
            <div>
              <h3 className="font-header text-base font-bold text-brand-primary">
                Floor Waiter Reputation Leaderboard
              </h3>
              <p className="text-xs text-brand-secondary mt-0.5">
                Calculated in real-time from verified customer reviews attached to tables assigned to each staff member.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Rank &amp; Attendant</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Rolling Average</th>
                    <th className="pb-3">Warmth (25%)</th>
                    <th className="pb-3">Promptness (25%)</th>
                    <th className="pb-3">Verified Reviews</th>
                    <th className="pb-3 pr-2 text-right">Performance Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/60">
                  {leaderboard.map((stf, idx) => (
                    <tr key={stf.id} className="hover:bg-background-subtle/50 transition">
                      <td className="py-3.5 pl-2 font-bold text-brand-primary">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "h-6 w-6 rounded-pill flex items-center justify-center text-[11px] font-bold border",
                            idx === 0
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-background-subtle text-brand-primary border-divider"
                          )}>
                            #{idx + 1}
                          </span>
                          <span>{stf.staffName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-brand-secondary">
                        {stf.role}
                      </td>

                      <td className="py-3.5 font-bold font-header text-sm text-status-occupied">
                        ★ {stf.ratingAverage.toFixed(2)} / 5.0
                      </td>

                      <td className="py-3.5 font-semibold text-brand-primary">
                        {stf.friendlinessScore.toFixed(1)} / 5.0 ★
                      </td>

                      <td className="py-3.5 font-semibold text-brand-primary">
                        {stf.speedScore.toFixed(1)} / 5.0 ★
                      </td>

                      <td className="py-3.5 text-brand-secondary">
                        {stf.totalReviews} reviews
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <span className={cn(
                          "rounded-pill px-2.5 py-0.5 text-[10px] font-bold border",
                          stf.status === "Top Performer"
                            ? "bg-status-available/10 text-status-available border-status-available/20"
                            : "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                        )}>
                          {stf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: Internal Service Triage & Recovery */}
      {/* ============================================================ */}
      {activeTab === "triage" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div>
              <h3 className="font-header text-base font-bold text-brand-primary">
                Service Recovery &amp; Complaint Resolution
              </h3>
              <p className="text-xs text-brand-secondary mt-0.5">
                Reviews with ratings below 4.0 are intercepted internally before reaching Google, enabling immediate managerial follow-up.
              </p>
            </div>
          </div>

          {unresolvedFeedbacks.length === 0 ? (
            <div className="rounded-card bg-background-subtle p-8 text-center space-y-2 border border-divider">
              <CheckCircle2 className="mx-auto h-8 w-8 text-status-available" />
              <p className="text-sm font-bold text-brand-primary">No outstanding complaints</p>
              <p className="text-xs text-brand-secondary">All recent dining experiences met high hospitality standards.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-card p-4 border border-status-occupied/30 bg-status-occupied/5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-brand-primary">
                        Table {fb.tableCode} (Attendant: {fb.staffName})
                      </span>
                      <p className="text-xs text-brand-secondary mt-0.5">{fb.createdAt} • {fb.orderNumber}</p>
                    </div>

                    <span className="rounded-pill bg-status-occupied text-white px-2.5 py-0.5 text-xs font-bold">
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
                      Status: {fb.resolved ? "Resolved" : "Awaiting Manager Review"}
                    </span>
                    {!fb.resolved && (
                      <button
                        onClick={() => handleResolve(fb.id)}
                        className="rounded-button bg-status-available px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
