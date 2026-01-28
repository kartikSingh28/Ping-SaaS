import { Router, Request, Response } from "express";
import { signUpSchema, signinSchema } from "../Schemas/AuthSchema";
import { signin, signup } from "../Auth/AuthPrisma";

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

export default userRouter;
