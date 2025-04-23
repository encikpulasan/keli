import { CreateUser, UpdateUser, User } from "../models/user.ts";
import { atomic, create, list, read, remove, update } from "../db/index.ts";
import { ConflictError, NotFoundError } from "../utils/error.ts";
import { hashPassword } from "../utils/auth.ts";
import { v4 } from "jsr:@std/uuid";

const COLLECTION = "users";

// Create a new user
export async function createUser(userData: CreateUser): Promise<User> {
  const userEmail = userData.email.toLowerCase();

  // Check if user with this email already exists
  const existingUsers = await list<User>(COLLECTION, {
    limit: 1,
  });

  const emailExists = existingUsers.items.some((user) =>
    user.email.toLowerCase() === userEmail
  );

  if (emailExists) {
    throw new ConflictError("User with this email already exists");
  }

  // Create new user
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();

  // Hash the password
  const password_hash = await hashPassword(userData.password);

  // Create the user object
  const user: User = {
    id: userId,
    email: userEmail,
    phone_number: userData.phone_number,
    password_hash,
    first_name: userData.first_name,
    last_name: userData.last_name,
    date_of_birth: userData.date_of_birth,
    account_status: "active",
    created_at: now,
    updated_at: now,
    last_login: undefined,
    referral_code: userData.referral_code || generateReferralCode(userId),
    preferences: userData.preferences || {},
  };

  // Save to database
  await create<User>(COLLECTION, userId, user);

  return user;
}

// Get a user by ID
export async function getUserById(id: string): Promise<User> {
  const user = await read<User>(COLLECTION, id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await list<User>(COLLECTION);
  const userEmail = email.toLowerCase();

  return users.items.find((user) => user.email.toLowerCase() === userEmail) ||
    null;
}

// Update a user
export async function updateUser(
  id: string,
  userData: UpdateUser,
): Promise<User> {
  const user = await getUserById(id);

  const updatedUser: User = {
    ...user,
    ...userData,
    updated_at: new Date().toISOString(),
  };

  await update<User>(COLLECTION, id, updatedUser);

  return updatedUser;
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  const user = await getUserById(id);

  if (user) {
    await remove(COLLECTION, id);
  }
}

// Update last login time
export async function updateLastLogin(id: string): Promise<User> {
  return await atomic<User>(COLLECTION, id, (user) => {
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      ...user,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

// Generate a referral code
function generateReferralCode(userId: string): string {
  // Use first 6 characters of userId and convert to uppercase
  const code = userId.slice(0, 6).toUpperCase();
  return `ZC${code}`;
}
