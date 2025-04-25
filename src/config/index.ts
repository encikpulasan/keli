import developmentConfig from "./environments/development.ts";
import stagingConfig from "./environments/staging.ts";
import productionConfig from "./environments/production.ts";

type Environment = "development" | "staging" | "production";

// Define the config interface
export interface Config {
  env: string;
  port: number;
  apiVersion: string;
  cors: {
    allowOrigin: string | string[];
    allowMethods: string[];
    allowHeaders: string[];
    exposeHeaders: string[];
    maxAge: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  apiKey: {
    defaultKey: string;
    headerName: string;
    requireApiKey: boolean;
    trackUsage: boolean;
  };
  logLevel: string;
  defaultAdmin?: {
    email: string;
    password: string;
  };
}

const env = (Deno.env.get("NODE_ENV") || "development") as Environment;

// Configuration map by environment
const configMap: Record<Environment, Config> = {
  development: developmentConfig as Config,
  staging: stagingConfig as Config,
  production: productionConfig as Config,
};

// Get the configuration for the current environment
const config = configMap[env];

export default config;
