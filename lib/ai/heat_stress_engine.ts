export interface ThermalInputSignals {
  ambient_temperature_c: number; // default e.g. 31.5°C
  humidity_percent: number;      // default e.g. 62%
  continuous_work_mins: number;  // from behaviour tracker
  fatigue_score: number;         // from fatigue engine (0-100)
  facial_redness_index: number;  // (0.0 - 1.0) RGB red channel saturation
  activity_intensity: "Low" | "Moderate" | "High" | "Strenuous";
  thermal_camera_temp_c?: number; // Optional physical thermal camera reading
}

export interface HeatStressAssessment {
  heat_status: "Optimal" | "Elevated Heat" | "High Heat Strain" | "Thermal Danger";
  risk_level: "Low" | "Moderate" | "High" | "Critical";
  estimated_core_temp_c: number;
  estimated_core_temp_f: number;
  wbgt_index: number;            // Wet-Bulb Globe Temp estimation (°C)
  hydration_reminder: string;
  recommended_rest_mins: number; // Rest per hour
  source: "Estimation Engine (Multi-Signal)" | "Thermal Infrared Camera";
}

/**
 * Modular Thermal Sensor Adapter & Multi-Signal Heat Stress Estimation Engine.
 * Supports seamless drop-in replacement when a hardware thermal infrared camera is connected.
 */
export function calculateHeatStress(signals: ThermalInputSignals): HeatStressAssessment {
  // If a hardware thermal camera stream is connected in future, hardware temp takes precedence
  if (signals.thermal_camera_temp_c !== undefined && signals.thermal_camera_temp_c > 0) {
    const directTempC = signals.thermal_camera_temp_c;
    const directTempF = roundOneDec((directTempC * 9) / 5 + 32);
    
    let heat_status: HeatStressAssessment["heat_status"] = "Optimal";
    let risk_level: HeatStressAssessment["risk_level"] = "Low";
    let hydration_reminder = "Maintain regular hydration (200ml per hour).";
    let recommended_rest_mins = 5;

    if (directTempC >= 38.8) {
      heat_status = "Thermal Danger";
      risk_level = "Critical";
      hydration_reminder = "CRITICAL THERMAL STRAIN! Immediate cooling & 500ml electrolyte intake required.";
      recommended_rest_mins = 30;
    } else if (directTempC >= 37.8) {
      heat_status = "High Heat Strain";
      risk_level = "High";
      hydration_reminder = "High thermal burden. Take a 15-minute rest break in a cool area and drink 350ml water.";
      recommended_rest_mins = 20;
    } else if (directTempC >= 37.2) {
      heat_status = "Elevated Heat";
      risk_level = "Moderate";
      hydration_reminder = "Elevated thermal stress accumulating. Drink 250ml water every 20 minutes.";
      recommended_rest_mins = 10;
    }

    return {
      heat_status,
      risk_level,
      estimated_core_temp_c: roundOneDec(directTempC),
      estimated_core_temp_f: directTempF,
      wbgt_index: roundOneDec((signals.ambient_temperature_c || 31) * 0.7 + ((signals.humidity_percent || 60) / 100) * 10),
      hydration_reminder,
      recommended_rest_mins,
      source: "Thermal Infrared Camera",
    };
  }

  // Multi-Signal Estimation Engine Formula
  const ambientC = signals.ambient_temperature_c || 31.5;
  const humidity = signals.humidity_percent || 62.0;
  const workMins = signals.continuous_work_mins || 0;
  const fatigue = signals.fatigue_score || 0;
  const redness = signals.facial_redness_index || 0.35; // 0.0 - 1.0

  // 1. Estimate Wet-Bulb Globe Temp (WBGT) Index
  const wbgt = roundOneDec(
    ambientC * 0.7 + (ambientC * (humidity / 100)) * 0.2 + (workMins / 60) * 0.5
  );

  // 2. Estimate Core Body Temperature (°C & °F)
  let metabolicIncrease = 0.0;
  if (signals.activity_intensity === "Strenuous") metabolicIncrease = 0.8;
  else if (signals.activity_intensity === "High") metabolicIncrease = 0.5;
  else if (signals.activity_intensity === "Moderate") metabolicIncrease = 0.3;

  const durationFactor = Math.min(1.2, (workMins / 120) * 0.4);
  const fatigueFactor = (fatigue / 100) * 0.5;
  const rednessFactor = (redness - 0.35) * 0.6;

  const estimatedCoreC = roundOneDec(
    36.8 + (ambientC > 30 ? (ambientC - 30) * 0.08 : 0) + metabolicIncrease + durationFactor + fatigueFactor + Math.max(0, rednessFactor)
  );
  const estimatedCoreF = roundOneDec((estimatedCoreC * 9) / 5 + 32);

  // 3. Classify Heat Status & Risk Level
  let heat_status: HeatStressAssessment["heat_status"] = "Optimal";
  let risk_level: HeatStressAssessment["risk_level"] = "Low";
  let hydration_reminder = "Environment comfortable. Maintain standard hydration (200ml per hour).";
  let recommended_rest_mins = 5;

  if (wbgt >= 31.0 || estimatedCoreF >= 100.4) {
    heat_status = "Thermal Danger";
    risk_level = "Critical";
    hydration_reminder = "CRITICAL HEAT STRESS ALERT! Stop work immediately. Drink 500ml electrolytes and move to air-conditioned rest zone.";
    recommended_rest_mins = 25;
  } else if (wbgt >= 28.0 || estimatedCoreF >= 99.3 || (ambientC >= 34.0 && workMins >= 45)) {
    heat_status = "High Heat Strain";
    risk_level = "High";
    hydration_reminder = "High thermal burden. Drink 350ml water, loosen tight gear, and take a 15-minute shaded break.";
    recommended_rest_mins = 15;
  } else if (wbgt >= 25.0 || estimatedCoreF >= 98.8 || workMins >= 60) {
    heat_status = "Elevated Heat";
    risk_level = "Moderate";
    hydration_reminder = "Elevated heat stress accumulating. Drink 250ml water every 20 minutes and adjust work posture.";
    recommended_rest_mins = 10;
  }

  return {
    heat_status,
    risk_level,
    estimated_core_temp_c: estimatedCoreC,
    estimated_core_temp_f: estimatedCoreF,
    wbgt_index: wbgt,
    hydration_reminder,
    recommended_rest_mins,
    source: "Estimation Engine (Multi-Signal)",
  };
}

function roundOneDec(val: number): number {
  return Math.round(val * 10) / 10;
}
