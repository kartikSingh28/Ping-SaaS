import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import cloudinary from "../lib/cloudinary"

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
      include: {
        profile: true
      }
    })

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile?.displayName || user.email,
      avatar: user.profile?.avatarUrl
    }))

    res.json(formattedUsers)

  } catch (err) {

    console.error("GET USERS ERROR:", err)

    res.status(500).json({
      message: "Failed to fetch users"
    })
  }
}

export async function uploadAvatar(req: any, res: any) {
  try {
    const userId = req.user.userId

    // multer gives file here
    const file = req.file

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded"
      })
    }

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(file.path)

    // save url in DB (UserProfile)
    await prisma.userProfile.update({
      where: { userId },
      data: {
        avatarUrl: result.secure_url
      }
    })

    return res.json({
      success: true,
      avatar: result.secure_url
    })

  } catch (err) {
    console.error("Avatar upload error:", err)

    return res.status(500).json({
      message: "Upload failed"
    })
  }
}