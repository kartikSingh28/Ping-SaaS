import prisma from "../lib/prisma";

export async function sendMessage(userId:string,conversationId:string,content:string){
    const member=await prisma.conversationMember.findFirst({
        where:{
            conversationId,
            userId
        }
    });

    if(!member){
        throw new Error("Not a member of this conversation");
    }

    return prisma.message.create({
        data:{
            conversationId,
            senderId:userId,
            content
        }
    });
}


export async function getConversationMessages(userId:string,conversationId:string){
    const member=await prisma.conversationMember.findFirst({
        where:{
            conversationId,
            userId
        }
    });

    if(!member){
        throw new Error("Not authorized");
    }

    return prisma.message.findMany({
        where:{
            conversationId
        },
        orderBy:{
            createdAt:"asc"
        }
    });
}
