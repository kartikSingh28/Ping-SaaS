import {z} from "zod";
const signUpSchema=z.object({
    email:z.string().email(),
    password:z.string().min(5).max(10),
    name:z.string().min(5),
});

const signinSchema=z.object({
    email:z.string().email(),
    password:z.string().min(5).max(10),
});

export type SignUpInput =z.infer<typeof signUpSchema>
export type SignInInput=z.infer<typeof signinSchema>