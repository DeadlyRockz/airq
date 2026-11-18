import { z } from "zod";

export const AqiScaleSchema = z.enum(["US_EPA", "INDIA_CPCB"]);
export type AqiScale = z.infer<typeof AqiScaleSchema>;

export const RiskTierSchema = z.enum([
  "low",
  "moderate",
  "elevated",
  "high",
  "very_high",
  "severe",
]);
export type RiskTier = z.infer<typeof RiskTierSchema>;

export const SensitivityGroupSchema = z.enum([
  "general",
  "sensitive_respiratory",
  "children_elderly",
  "outdoor_worker",
]);
export type SensitivityGroup = z.infer<typeof SensitivityGroupSchema>;

export const CommuteModeSchema = z.enum([
  "walk_cycle",
  "public_transit",
  "car_ac_recirculate",
  "work_from_home",
]);
export type CommuteMode = z.infer<typeof CommuteModeSchema>;

export const ActivityGoalSchema = z.enum(["commute", "outdoor_exercise", "errands", "indoor_day"]);
export type ActivityGoal = z.infer<typeof ActivityGoalSchema>;

export const IndoorFuelSourceSchema = z.enum([
  "none_electric",
  "gas_stove_unvented",
  "solid_fuel_or_kerosene",
]);
export type IndoorFuelSource = z.infer<typeof IndoorFuelSourceSchema>;

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const UserContextSchema = z.object({
  locationLabel: z.string().trim().min(1).max(120),
  coordinates: CoordinatesSchema.optional(),
  preferredScale: AqiScaleSchema,
  sensitivityGroup: SensitivityGroupSchema,
  commuteMode: CommuteModeSchema,
  activityGoal: ActivityGoalSchema,
  indoorFuelSource: IndoorFuelSourceSchema,
  hasHepaPurifier: z.boolean(),
  hasIndoorSensor: z.boolean(),
});
export type UserContext = z.infer<typeof UserContextSchema>;

export const PollutantsSchema = z.object({
  /** Fine particulate matter in µg/m³ */
  pm2_5: z.number().nonnegative().optional(),
  /** Coarse particulate matter in µg/m³ */
  pm10: z.number().nonnegative().optional(),
  /** Nitrogen dioxide in µg/m³ */
  no2: z.number().nonnegative().optional(),
  /** Ground-level ozone in µg/m³ */
  o3: z.number().nonnegative().optional(),
});
export type Pollutants = z.infer<typeof PollutantsSchema>;

export const ObservationTypeSchema = z.enum([
  "observation",
  "modeled_estimate",
  "forecast",
  "sample_fixture",
]);
export type ObservationType = z.infer<typeof ObservationTypeSchema>;

export const DominantPollutantSchema = z.enum(["PM2.5", "PM10", "NO2", "O3", "Composite"]);
export type DominantPollutant = z.infer<typeof DominantPollutantSchema>;

export const AqiReadingSchema = z.object({
  locationName: z.string().trim().min(1),
  country: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  scale: AqiScaleSchema,
  value: z.number().nonnegative(),
  category: z.string().trim().min(1),
  riskTier: RiskTierSchema,
  dominantPollutant: DominantPollutantSchema,
  pollutants: PollutantsSchema,
  source: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  timestamp: z.string().trim().min(1),
  observationType: ObservationTypeSchema,
  uncertainty: z.string().trim().min(1),
  isSampleData: z.boolean(),
});
export type AqiReading = z.infer<typeof AqiReadingSchema>;
