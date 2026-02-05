import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../utils/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (!decoded) {
      res.status(401).json({
        error: "Invalid token"
      })
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}


export const authorize = (role: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user

  if (!user || !role.includes(user.role)) {
    return res.status(403).json({
      error: 'Forbidden (wrong role)'
    })
  }
  next()
}