import { Router, Request, Response } from "express";
import {signUpSchema,signinSchema} from "../Schemas/AuthSchema";
import {signin,signup} from "../Auth/AuthPrisma";
import {Router} from "express";

const userRouter = Router();
userRouter.use(express.json());

userRouter.get("/",(req:Request,res:Response)=>{
    res.send("Server is running");
})

userRouter.post("/signup", async (req:Request,res:Response) => {
    const parsedData=signUpSchema.safeParse(req.body);

    if(!parsedData.success){
        return res.status(400).json({
            message:"Some Error Occured!",
            error:parsedData.error,
        });
    }
  
});

export default userAuthRouter;
