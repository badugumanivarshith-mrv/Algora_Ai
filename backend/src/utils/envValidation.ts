export interface EnvValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  configSummary: Record<string, string | number | boolean>;
}

export function validateProductionEnvironment(): EnvValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const nodeEnv = process.env.NODE_ENV || "development";
  const port = process.env.PORT || "3000";
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const jwtSecret = process.env.JWT_SECRET;

  if (nodeEnv === "production") {
    if (!jwtSecret || jwtSecret.includes("dev") || jwtSecret.length < 32) {
      warnings.push("JWT_SECRET should be a secure, random string of at least 32 characters in production.");
    }

    if (!hasGeminiKey) {
      warnings.push("GEMINI_API_KEY is not set. AI features will run on high-fidelity deterministic Socratic fallback mode.");
    }

    if (!hasDbUrl) {
      warnings.push("DATABASE_URL is not set. System is operating with high-speed in-memory database fallback.");
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    warnings,
    errors,
    configSummary: {
      nodeEnv,
      port: Number(port),
      hasGeminiKey,
      hasDbUrl,
      jwtConfigured: Boolean(jwtSecret),
    },
  };
}
