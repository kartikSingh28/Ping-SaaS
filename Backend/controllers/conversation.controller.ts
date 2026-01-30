import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function createPrivateConversation(req: Request, res: Response){
    try{
        const userId=(req as any).user.id;
        const {otherUserId}=req.body;

        if(!otherUserId){
            return res.status(400).json({message:"otherUserId required"});
        }

        if(userId===otherUserId){
            return res.status(400).json({message:"Cannot chat with yourself"});
        }

        const existing=await prisma.conversation.findFirst({
            where:{
                type:"ONE_TO_ONE",
                AND:[
                    {members:{some:{userId}}},
                    {members:{some:{userId:otherUserId}}}
                ]
            }
        });

        if(existing) return res.json(existing);

        const conversation=await prisma.conversation.create({
            data:{
                type:"ONE_TO_ONE",
                createdBy:userId,
                members:{
                    create:[
                        {userId},
                        {userId:otherUserId}
                    ]
                }
            }
        });

        res.status(201).json(conversation);

    }catch{
        res.status(500).json({message:"Server error"});
    }
}

export async function getMyConversations(req: Request, res: Response){
    try{
        const userId=(req as any).user.id;

        const conversations=await prisma.conversation.findMany({
            where:{
                members:{some:{userId}}
            },
            include:{
                members:true
            }
        });

        res.json(conversations);

    }catch{
        res.status(500).json({message:"Server error"});
    }
}
