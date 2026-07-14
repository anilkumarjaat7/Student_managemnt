import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export interface JwtPayload {
  email: string;
  role: string;
}

const getSecret = () => new TextEncoder().encode(JWT_SECRET);

export async function validateCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (email !== ADMIN_EMAIL) return false;
  return password === ADMIN_PASSWORD;
}

export async function generateToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
