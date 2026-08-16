"use server";

import { revalidatePath } from "next/cache";

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
  staffRatingQ1: number; // Friendliness (1-5)
  staffRatingQ2: number; // Accuracy & Speed (1-5)
  foodRating: number; // Food Quality (1-5)
  speedRating: number; // Delivery Speed (1-5)
  ambienceRating: number; // Cleanliness / Ambience (1-5)
  weightedScore: number;
  comment?: string;
  redirectedToGoogle: boolean;
  resolved: boolean;
  createdAt: string;
}

let mockStaffLeaderboard: MockStaffRankItem[] = [
  {
    id: "stf-01",
    staffName: "Michael Tadesse",
    role: "Lead Waiter (Main Hall)",
    ratingAverage: 4.92,
    totalReviews: 124,
    friendlinessScore: 4.95,
    speedScore: 4.88,
    status: "Excellent",
  },
  {
    id: "stf-02",
    staffName: "Sara Mengistu",
    role: "Terrace Garden Waiter",
    ratingAverage: 4.88,
    totalReviews: 98,
    friendlinessScore: 4.92,
    speedScore: 4.84,
    status: "Excellent",
  },
  {
    id: "stf-03",
    staffName: "Eden Haile",
    role: "Lounge & Bar Waiter",
    ratingAverage: 4.75,
    totalReviews: 82,
    friendlinessScore: 4.8,
    speedScore: 4.7,
    status: "Good",
  },
  {
    id: "stf-04",
    staffName: "Dawit Bekele",
    role: "VIP Alcove Host",
    ratingAverage: 4.96,
    totalReviews: 45,
    friendlinessScore: 4.98,
    speedScore: 4.94,
    status: "Excellent",
  },
  {
    id: "stf-05",
    staffName: "Senait Alemu",
    role: "Evening Relief Waiter",
    ratingAverage: 4.35,
    totalReviews: 32,
    friendlinessScore: 4.5,
    speedScore: 4.2,
    status: "Good",
  },
];

let mockFeedbackDb: MockDetailedFeedbackItem[] = [
  {
    id: "fb-01",
    tableCode: "T-03",
    orderNumber: "#KD-398",
    staffId: "stf-01",
    staffName: "Michael Tadesse",
    staffRatingQ1: 5,
    staffRatingQ2: 5,
    foodRating: 5,
    speedRating: 5,
    ambienceRating: 5,
    weightedScore: 5.0,
    comment: "The Sizzling Awaze Tibs was extraordinary. Michael anticipated our every request. Wonderful evening!",
    redirectedToGoogle: true,
    resolved: true,
    createdAt: "12m ago",
  },
  {
    id: "fb-02",
    tableCode: "T-01",
    orderNumber: "#KD-394",
    staffId: "stf-02",
    staffName: "Sara Mengistu",
    staffRatingQ1: 5,
    staffRatingQ2: 5,
    foodRating: 4,
    speedRating: 5,
    ambienceRating: 5,
    weightedScore: 4.75,
    comment: "Delightful honey tej on the terrace. Very welcoming staff.",
    redirectedToGoogle: true,
    resolved: true,
    createdAt: "30m ago",
  },
  {
    id: "fb-03",
    tableCode: "T-18",
    orderNumber: "#KD-391",
    staffId: "stf-03",
    staffName: "Eden Haile",
    staffRatingQ1: 4,
    staffRatingQ2: 5,
    foodRating: 5,
    speedRating: 4,
    ambienceRating: 4,
    weightedScore: 4.45,
    redirectedToGoogle: true,
    resolved: true,
    createdAt: "50m ago",
  },
  {
    id: "fb-04",
    tableCode: "T-14",
    orderNumber: "#KD-386",
    staffId: "stf-01",
    staffName: "Michael Tadesse",
    staffRatingQ1: 4,
    staffRatingQ2: 4,
    foodRating: 4,
    speedRating: 3,
    ambienceRating: 3,
    weightedScore: 3.65,
    comment: "Food taste was wonderful, but kitchen took 25 minutes during the rush. Music was also slightly loud.",
    redirectedToGoogle: false,
    resolved: false,
    createdAt: "1h 15m ago",
  },
];

export async function getReviewsData() {
  const totalReviews = mockFeedbackDb.length + 340;
  const redirectedToGoogleCount = Math.round(totalReviews * 0.88);
  const avgWeightedScore = 4.88;

  return {
    summary: {
      avgWeightedScore,
      totalReviews,
      redirectedToGoogleCount,
      googleConversionPercent: 88.2,
      internalResolutionCount: 8,
    },
    leaderboard: mockStaffLeaderboard,
    feedbacks: mockFeedbackDb,
  };
}

export async function resolveComplaintAction(feedbackId: string) {
  mockFeedbackDb = mockFeedbackDb.map((fb) => {
    if (fb.id === feedbackId) {
      return { ...fb, resolved: true };
    }
    return fb;
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin/dashboard");
  return { success: true, feedbacks: mockFeedbackDb };
}
