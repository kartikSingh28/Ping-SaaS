import { Router, Request, Response } from "express";
import { signUpSchema, signinSchema } from "../Schemas/AuthSchema";
import { signin, signup } from "../Auth/AuthPrisma";
import { getAllUsers } from "../controllers/user.controller";
import { userMiddleware } from "../Middleware/AuthMiddleware";
import multer from "multer"
import { uploadAvatar } from "../controllers/user.controller"


const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) => {
  res.send("User router is running");
});

userRouter.post("/signup", async (req: Request, res: Response) => {
  const parsedData = signUpSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Validation failed",
      error: parsedData.error,
    });
  }

  try {
    const result = await signup(parsedData.data);
    res.status(201).json({
      message: "User successfully registered",
      user: result,
    });
  } catch (e: any) {
    res.status(400).json({
      error: e.message,
    });
  }
});
userRouter.post("/signin", async (req: Request,res: Response) => {
  const parsedData = signinSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Validation failed",
      error: parsedData.error,
    });
  }
  try {
    const result = await signin(parsedData.data);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({
      error: e.message,
    });
  }
});
userRouter.get("/all",userMiddleware, getAllUsers);


const upload = multer({ dest: "uploads/" })

userRouter.post(
  "/upload-avatar",
  userMiddleware,
  upload.single("avatar"), // VERY IMPORTANT
  uploadAvatar
)


export default userRouter;
