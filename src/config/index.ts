import developmentConfig from "./environments/development.ts";
import stagingConfig from "./environments/staging.ts";
import productionConfig from "./environments/production.ts";

type Environment = "development" | "staging" | "production";

const env = (Deno.env.get("NODE_ENV") || "development") as Environment;

// Configuration map by environment
const configMap = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Get the configuration for the current environment
const config = configMap[env];

export default config;
