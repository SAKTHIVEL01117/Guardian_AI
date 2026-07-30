export interface PredictiveInputData {
  worker_id?: string;
  current_fatigue_score: number; // 0 - 100
  recent_fatigue_scores?: number[];
  continuous_work_mins: number;
  idle_mins: number;
  incident_count: number;
  ambient_temp_c?: number;
  wbgt_index?: number;
  movement_frequency?: number;
}

export type RecommendationType = "Schedule a break" | "Rotate tasks" | "Hydrate" | "Supervisor intervention";

export interface ActionableRecommendation {
  type: RecommendationType;
  priority: "High" | "Medium" | "Urgent";
  title: string;
  description: string;
  action_text: string;
  color: string;
}

export interface PredictiveReport {
  fatigue_risk_30m: {
    score: number; // 0 - 100%
    trend: "Increasing Rapidly" | "Increasing Moderately" | "Stable" | "Low Risk";
    projected_score_30m: number;
  };
  productivity_decline: {
    rate_percent: number; // e.g. 18.5%
    forecast_text: string;
  };
  burnout_risk: {
    score: number; // 0 - 100%
    level: "Low" | "Moderate" | "High" | "Critical";
  };
  heat_stress_risk: {
    score: number; // 0 - 100%
    level: "Optimal" | "Moderate Risk" | "High Risk" | "Thermal Danger";
    wbgt_index: number;
  };
  accident_probability: {
    percent: number; // 0 - 100%
    risk_category: "Nominal" | "Elevated" | "High" | "Hazard Warning";
  };
  recommendations: ActionableRecommendation[];
}

/**
 * Decoupled Asynchronous Predictive Analytics Engine
 * Calculates 30-min fatigue forecast, productivity decline, burnout risk, heat stress risk,
 * accident probability, and generates 4 actionable AI recommendations.
 */
export function calculatePredictiveAnalytics(input: PredictiveInputData): PredictiveReport {
  const currentFatigue = input.current_fatigue_score || 18.0;
  const workMins = input.continuous_work_mins || 45;
  const idleMins = input.idle_mins || 10;
  const incidents = input.incident_count || 0;
  const ambientC = input.ambient_temp_c || 31.5;
  const wbgt = input.wbgt_index || 26.5;

  // 1. Calculate 30-Min Fatigue Risk & Projected Score
  const fatigueDelta = Math.min(35, (workMins / 60) * 8.0 + (incidents > 0 ? 10 : 0));
  const projected30m = Math.min(100, Math.round((currentFatigue + fatigueDelta) * 10) / 10);
  
  let fatigueTrend: PredictiveReport["fatigue_risk_30m"]["trend"] = "Stable";
  if (projected30m >= 70) fatigueTrend = "Increasing Rapidly";
  else if (projected30m >= 45) fatigueTrend = "Increasing Moderately";
  else if (projected30m < 25) fatigueTrend = "Low Risk";

  // 2. Calculate Productivity Decline (% Expected Loss Next Hour)
  const declineRate = Math.min(65, Math.max(4, Math.round((projected30m / 100) * 42 + (idleMins / 60) * 12)));
  const forecastText = declineRate >= 30
    ? `High productivity loss (${declineRate}%) expected due to accumulating fatigue.`
    : declineRate >= 15
    ? `Moderate decline (${declineRate}%) anticipated without rest.`
    : `Optimal performance maintained (${declineRate}% nominal variance).`;

  // 3. Calculate Burnout Risk Index (0 - 100%)
  const burnoutScore = Math.min(100, Math.max(8, Math.round((workMins / 180) * 35 + (projected30m / 100) * 45 + incidents * 8)));
  let burnoutLevel: PredictiveReport["burnout_risk"]["level"] = "Low";
  if (burnoutScore >= 75) burnoutLevel = "Critical";
  else if (burnoutScore >= 55) burnoutLevel = "High";
  else if (burnoutScore >= 35) burnoutLevel = "Moderate";

  // 4. Calculate Heat Stress Risk
  const heatScore = Math.min(100, Math.max(10, Math.round((wbgt / 32) * 60 + (workMins / 120) * 25 + (ambientC > 30 ? (ambientC - 30) * 4 : 0))));
  let heatLevel: PredictiveReport["heat_stress_risk"]["level"] = "Optimal";
  if (heatScore >= 80 || wbgt >= 31) heatLevel = "Thermal Danger";
  else if (heatScore >= 60 || wbgt >= 28) heatLevel = "High Risk";
  else if (heatScore >= 40 || wbgt >= 25) heatLevel = "Moderate Risk";

  // 5. Calculate Accident Probability Index (0 - 100%)
  const accidentPercent = Math.min(96, Math.max(1, Math.round(
    (projected30m >= 60 ? (projected30m - 60) * 1.2 : 2) +
    (incidents * 14) +
    (burnoutScore > 65 ? 18 : 3) +
    (heatLevel === "Thermal Danger" ? 22 : 0)
  )));

  let accidentCategory: PredictiveReport["accident_probability"]["risk_category"] = "Nominal";
  if (accidentPercent >= 50) accidentCategory = "Hazard Warning";
  else if (accidentPercent >= 30) accidentCategory = "High";
  else if (accidentPercent >= 15) accidentCategory = "Elevated";

  // 6. Generate 4 Actionable AI Recommendations
  const recommendations: ActionableRecommendation[] = [];

  // A. Schedule a Break
  if (workMins >= 60 || projected30m >= 50 || burnoutScore >= 50) {
    recommendations.push({
      type: "Schedule a break",
      priority: projected30m >= 70 ? "Urgent" : "High",
      title: "Schedule Mandatory Rest Break",
      description: `Operator continuous work time reached ${workMins} mins. Schedule a 15-minute rest break in cooling lounge.`,
      action_text: "Dispatch Rest Notice",
      color: "bg-amber-500",
    });
  }

  // B. Rotate Tasks
  if (burnoutScore >= 45 || declineRate >= 20 || incidents > 0) {
    recommendations.push({
      type: "Rotate tasks",
      priority: burnoutScore >= 65 ? "Urgent" : "Medium",
      title: "Task Rotation Advisory",
      description: "Reassign operator from high-fatigue precision assembly to low-strain quality inspection role.",
      action_text: "Reassign Workstation",
      color: "bg-indigo-500",
    });
  }

  // C. Hydrate
  if (heatLevel !== "Optimal" || ambientC >= 30 || workMins >= 45) {
    recommendations.push({
      type: "Hydrate",
      priority: heatLevel === "Thermal Danger" ? "Urgent" : "Medium",
      title: "Electrolyte Hydration Protocol",
      description: `Ambient WBGT index ${wbgt}°C (${ambientC}°C). Instruct operator to drink 350ml cool water or electrolytes.`,
      action_text: "Send Hydration Alert",
      color: "bg-cyan-500",
    });
  }

  // D. Supervisor Intervention
  if (incidents > 0 || accidentPercent >= 30 || projected30m >= 75) {
    recommendations.push({
      type: "Supervisor intervention",
      priority: "Urgent",
      title: "Immediate Supervisor Intervention",
      description: `Accident probability reached ${accidentPercent}%. Supervisor floor check-in and safety protocol verification required.`,
      action_text: "Dispatch Supervisor",
      color: "bg-rose-600",
    });
  }

  // Fallback defaults if recommendations empty
  if (recommendations.length === 0) {
    recommendations.push({
      type: "Schedule a break",
      priority: "Medium",
      title: "Scheduled Hourly Rest",
      description: "Standard scheduled rest break recommended in 20 minutes to maintain optimal focus.",
      action_text: "Log Schedule",
      color: "bg-emerald-500",
    });
  }

  return {
    fatigue_risk_30m: {
      score: projected30m,
      trend: fatigueTrend,
      projected_score_30m: projected30m,
    },
    productivity_decline: {
      rate_percent: declineRate,
      forecast_text: forecastText,
    },
    burnout_risk: {
      score: burnoutScore,
      level: burnoutLevel,
    },
    heat_stress_risk: {
      score: heatScore,
      level: heatLevel,
      wbgt_index: wbgt,
    },
    accident_probability: {
      percent: accidentPercent,
      risk_category: accidentCategory,
    },
    recommendations,
  };
}
