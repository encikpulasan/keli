import { createUser, getUserByEmail } from "../services/user-service.ts";
import logger from "./logger.ts";
import config from "../config/index.ts";
import { CreateUser } from "../models/user.ts";

/**
 * Initializes a default admin user if one doesn't already exist
 */
export async function initializeDefaultAdmin(): Promise<void> {
  try {
    // Check if admin user already exists
    const adminEmail = config.defaultAdmin?.email || "admin@keli.com";
    const existingAdmin = await getUserByEmail(adminEmail);

    if (existingAdmin) {
      logger.info(`Default admin user already exists: ${adminEmail}`);
      return;
    }

    // Create default admin user with minimum required fields
    // Note: The CreateUser type doesn't require password_hash as it's handled by the service
    const adminUser: Omit<CreateUser, "password_hash"> = {
      email: adminEmail,
      password: config.defaultAdmin?.password || "admin123",
      confirm_password: config.defaultAdmin?.password || "admin123",
      first_name: "Admin",
      last_name: "User",
    };

    const newAdmin = await createUser(adminUser, "admin");
    logger.info(`Default admin user created: ${adminEmail}`);

    return;
  } catch (error) {
    logger.error("Failed to initialize default admin user", error);
    // Not throwing error to avoid crashing app startup
  }
}
