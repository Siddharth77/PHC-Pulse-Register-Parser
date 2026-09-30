// Configuration for PHC Pulse
// Allows seamless switching between local mock datasets and live Cloud Run / Firebase backends

export const CONFIG = {
  APP_NAME: "PHC Pulse",
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK !== "false", // defaults to true for standalone execution
  DEFAULT_LANGUAGE: "en" as const,
  SUPPORTED_LANGUAGES: ["en", "hi", "mr", "ml", "as"] as const,
  DEMO_STATES: ["Madhya Pradesh", "Maharashtra", "Kerala", "Assam"] as const,
  POLL_INTERVAL_MS: 30000,
  GEMINI_MODEL: "gemini-3.8-flash",
};

export type LanguageCode = (typeof CONFIG.SUPPORTED_LANGUAGES)[number];
export type UserRole = "phc_staff" | "district_officer" | "state_national_officer";
