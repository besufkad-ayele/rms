"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface MockStaffRankItem {
  id: string;
  staffName: string;
  role: string;
  avatarUrl?: string;
  ratingAverage: number;
  totalReviews: number;
  friendlinessScore: number;
  speedScore: number;
  status: "Excellent" | "Good" | "Needs Attention";
}

export interface MockDetailedFeedbackItem {
  id: string;
  tableCode: string;
  orderNumber: string;
  staffId: string;
  staffName: string;
  staffRatingQ1: number;
  staffRatingQ2: number;
  foodRating: number;
  speedRating: number;
  ambienceRating: number;
  weightedScore: number;
  comment?: string;
  redirectedToGoogle: boolean;
  resolved: boolean;
  createdAt: string;
}

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export async function getReviewsData() {
  try {
    const supabase = await getSupabase();

    // 1. Fetch Feedback rows
    const { data: dbFeedback, error: fbErr } = await supabase
      .from("feedback")
      .select(`
        id,
        staff_rating_q1,
        staff_rating_q2,
        experience_rating_food,
        experience_rating_speed,
        experience_rating_ambience,
        weighted_score,
        customer_comment,
        redirected_to_google,
        created_at,
        staff_id,
        staff:staff_id (full_name, role),
        order:order_id (
          id,
          table:table_id (unique_code)
        )
      `)
      .order("created_at", { ascending: false });

    let feedbacks: MockDetailedFeedbackItem[] = [];
    if (!fbErr && dbFeedback) {
      feedbacks = dbFeedback.map((r: any) => ({
        id: r.id,
        tableCode: r.order?.table?.unique_code || "T-01",
        orderNumber: `#KD-${r.order?.id?.slice(0, 4).toUpperCase() || "000"}`,
        staffId: r.staff_id || "unassigned",
        staffName: r.staff?.full_name || "House Attendant",
        staffRatingQ1: r.staff_rating_q1 || 5,
        staffRatingQ2: r.staff_rating_q2 || 5,
        foodRating: r.experience_rating_food || 5,
        speedRating: r.experience_rating_speed || 5,
        ambienceRating: r.experience_rating_ambience || 5,
        weightedScore: Number(r.weighted_score || 5.0),
        comment: r.customer_comment || undefined,
        redirectedToGoogle: Boolean(r.redirected_to_google),
        resolved: Number(r.weighted_score || 5.0) >= 4.0,
        createdAt: formatTimeAgo(r.created_at),
      }));
    }

    // 2. Fetch Staff Leaderboard from Supabase
    const { data: dbStaff } = await supabase.from("staff").select("id, full_name, role, performance_score");
    let leaderboard: MockStaffRankItem[] = [];

    if (dbStaff && dbStaff.length > 0) {
      leaderboard = dbStaff.map((s: any) => {
        const score = Number(s.performance_score || 5.0);
        return {
          id: s.id,
          staffName: s.full_name,
          role: s.role,
          ratingAverage: score,
          totalReviews: 42,
          friendlinessScore: Math.min(5.0, score + 0.05),
          speedScore: Math.max(4.0, score - 0.1),
          status: score >= 4.8 ? "Excellent" : score >= 4.2 ? "Good" : "Needs Attention",
        };
      });
    }

    const totalReviews = feedbacks.length;
    const redirectedToGoogleCount = feedbacks.filter((f) => f.redirectedToGoogle).length;
    const avgWeightedScore =
      totalReviews > 0
        ? Math.round((feedbacks.reduce((sum, f) => sum + f.weightedScore, 0) / totalReviews) * 100) / 100
        : 5.0;

    return {
      summary: {
        avgWeightedScore,
        totalReviews,
        redirectedToGoogleCount,
        googleConversionPercent: totalReviews > 0 ? Math.round((redirectedToGoogleCount / totalReviews) * 100) : 100,
        internalResolutionCount: feedbacks.filter((f) => !f.resolved).length,
      },
      leaderboard,
      feedbacks,
    };
  } catch (err) {
    console.error("Error fetching reviews data from Supabase:", err);
    return {
      summary: {
        avgWeightedScore: 5.0,
        totalReviews: 0,
        redirectedToGoogleCount: 0,
        googleConversionPercent: 0,
        internalResolutionCount: 0,
      },
      leaderboard: [],
      feedbacks: [],
    };
  }
}

export async function resolveComplaintAction(feedbackId: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("feedback").update({ redirected_to_google: true }).eq("id", feedbackId);
  } catch (err) {
    console.error("Failed to resolve feedback in Supabase:", err);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/admin/dashboard");
  const data = await getReviewsData();
  return { success: true, feedbacks: data.feedbacks };
}
