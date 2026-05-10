import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../utils/types";

// Validate JWT_SECRET at module initialization. This ensures the app doesn't start
// with a weak or missing secret in production.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is not set. Application cannot start securely.");
  throw new Error("JWT_SECRET environment variable is not set.");
}
if (JWT_SECRET === "your-secret-key") {
  console.warn("WARNING: Using default JWT_SECRET 'your-secret-key'. Change this for production environments.");
}


export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No authentication token provided or invalid format." });
    return;
  }

  const token = authHeader.substring(7);

  try {
    // JWT_SECRET is guaranteed to be a string here due to the check above.
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // The `if (!decoded)` check from the original code is redundant. If jwt.verify succeeds,
    // `decoded` will be an object. If it fails, it will throw an error caught by the catch block.

    req.user = decoded; // Attach decoded user information to the request
    next();
  } catch (error) {
    console.error("Authentication failed: Token verification error.", error); // Log the actual error for debugging
    res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
}


export const authorize = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    // This case ideally should not happen if 'authenticate' middleware runs before 'authorize',
    // but it's a good defensive check.
    return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
  }

  if (!roles.includes(user.role)) {
    return res.status(403).json({
      error: 'Forbidden: Insufficient permissions for this action.'
    });
  }
  next();
};