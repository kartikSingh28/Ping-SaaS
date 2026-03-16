import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

interface AuthRequest extends Request {
  user: {
    userId: string
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {

    const userId = req.user.userId

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId
        }
      },
      select: {
        id: true,
        email: true
      }
    })

    res.json(users)

  } catch (err) {

    console.error("GET USERS ERROR:", err)

    res.status(500).json({
      message: "Failed to fetch users"
    })
  }
}