import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const SALT_ROUNDS = 10;

export class AuthError extends Error {}

export async function register({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashedPassword, role });
  return user;
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthError("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthError("Invalid email or password.");
  }

  return user;
}
