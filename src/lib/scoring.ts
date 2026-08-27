import { PerformanceScore } from '@/types';

/**
 * Community Performance Score Engine
 * Computes a weighted score (0 - 100):
 * - Reliability (40%): Assigned campaign acceptance & completion rate
 * - Activity (30%): Verified active engagement and admin quality review
 * - Performance (30%): Tracked clicks and measurable outcomes relative to member size
 */
export function calculateCommunityScore(metrics: {
  completedAssignments: number;
  totalAssignments: number;
  adminActivityRating: number; // 0 to 100
  totalClicksGenerated: number;
  memberCount: number;
}): {
  reliabilityScore: number;
  activityScore: number;
  performanceScore: number;
  compositeScore: number;
} {
  // 1. Reliability Score (40% weight): Completion rate
  let reliabilityScore = 100;
  if (metrics.totalAssignments > 0) {
    const completionRate = (metrics.completedAssignments / metrics.totalAssignments) * 100;
    reliabilityScore = Math.min(100, Math.max(0, completionRate));
  }

  // 2. Activity Score (30% weight): Admin verified activity rating
  const activityScore = Math.min(100, Math.max(0, metrics.adminActivityRating || 80));

  // 3. Performance Score (30% weight): Click Through Efficiency
  let performanceScore = 70; // baseline
  if (metrics.totalAssignments > 0 && metrics.memberCount > 0) {
    const avgClicksPerAssignment = metrics.totalClicksGenerated / metrics.totalAssignments;
    const clickRatio = (avgClicksPerAssignment / metrics.memberCount) * 100; // e.g. 50 clicks in 1000 member group = 5%
    // 3% - 8% is healthy for WhatsApp groups
    performanceScore = Math.min(100, Math.max(30, clickRatio * 15 + 40));
  }

  // Composite Calculation: 40% Reliability + 30% Activity + 30% Performance
  const compositeScore = Number(
    (0.4 * reliabilityScore + 0.3 * activityScore + 0.3 * performanceScore).toFixed(1)
  );

  return {
    reliabilityScore: Number(reliabilityScore.toFixed(1)),
    activityScore: Number(activityScore.toFixed(1)),
    performanceScore: Number(performanceScore.toFixed(1)),
    compositeScore,
  };
}

