import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mxk-dev-secret";

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyLogin(email: string, password: string): boolean {
  return email === (process.env.ADMIN_EMAIL || "admin@mxk.com") && password === (process.env.ADMIN_PASSWORD || "mxkadmin2026");
}

/** Reject unless a valid admin token is present. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Please sign in." });
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as { role?: string };
    if (payload.role !== "admin") return res.status(403).json({ error: "Admin access only." });
    next();
  } catch {
    return res.status(401).json({ error: "Session expired — sign in again." });
  }
}
