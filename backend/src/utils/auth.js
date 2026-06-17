import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
