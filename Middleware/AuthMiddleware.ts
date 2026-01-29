import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader =
      req.headers.authorization || (req.headers.Authorization as string);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization Denied: No Token",
      });
    }
    const token =authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    (req as any).user = decoded;
    next();
  } catch (e: any) {
    console.log("Authorization error:", e.message);
    return res.status(401).json({
      message: "You need to sign in first",
    });
  }
}
