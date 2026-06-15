import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import cloudinary from "../lib/cloudinary"

export async function getAllUsers(
  req: Request,
  res: Response
) {
  try {

    const userId = (req as any).user.userId

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

    return res.json(formattedUsers)

  } catch (err) {

    console.error("GET USERS ERROR:", err)

    return res.status(500).json({
      message: "Failed to fetch users"
    })
  }
}

export async function uploadAvatar(
  req: any,
  res: any
) {
  try {

    const userId = req.user.userId
    const file = req.file

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded"
      })
    }

    const result =
      await cloudinary.uploader.upload(file.path)

    await prisma.userProfile.update({
      where: {
        userId
      },
      data: {
        avatarUrl: result.secure_url
      }
    })

    return res.json({
      success: true,
      avatar: result.secure_url
    })

  } catch (err) {

    console.error(
      "Avatar upload error:",
      err
    )

    return res.status(500).json({
      message: "Upload failed"
    })
  }
}

export async function getMe(
  req: Request,
  res: Response
) {
  try {

    const userId = (req as any).user.userId

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId
        },
        include: {
          profile: true
        }
      })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    return res.json({
      id: user.id,
      email: user.email,
      name:
        user.profile?.displayName ||
        user.email,
      avatar:
        user.profile?.avatarUrl || null
    })

  } catch (err) {

    console.error(
      "GET ME ERROR:",
      err
    )

    return res.status(500).json({
      message: "Failed to fetch user"
    })
  }
}