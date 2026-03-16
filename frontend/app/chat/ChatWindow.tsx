"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export default function ChatWindow({ selectedUser }: any){

const [content,setContent] = useState("")
const [messages,setMessages] = useState<any[]>([])
const [conversationId,setConversationId] = useState("")
const [myId,setMyId] = useState("")

const socketRef = useRef<Socket | null>(null)
const bottomRef = useRef<HTMLDivElement | null>(null)

/* GET MY USER ID FROM TOKEN */

useEffect(()=>{
const token = localStorage.getItem("token")

if(token){
const payload = JSON.parse(atob(token.split(".")[1]))
setMyId(payload.userId)
}
},[])

/* CONNECT SOCKET */

useEffect(()=>{

socketRef.current = io("http://localhost:3000")

socketRef.current.on("new_message",(message:any)=>{

setMessages(prev=>{

const exists = prev.find(m => m.id === message.id)
if(exists) return prev

return [...prev,message]

})

})

return ()=>{
socketRef.current?.disconnect()
}

},[])

/* LOAD CONVERSATION + MESSAGES */

useEffect(()=>{

if(!selectedUser) return

const token = localStorage.getItem("token")

async function loadMessages(){

const convoRes = await fetch("http://localhost:3000/conversations/private",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
otherUserId:selectedUser.id
})
})

const conversation = await convoRes.json()

setConversationId(conversation.id)

socketRef.current?.emit("join_conversation",conversation.id)

const msgRes = await fetch(`http://localhost:3000/messages/${conversation.id}`,{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await msgRes.json()

setMessages(data.messages || data)

}

loadMessages()

},[selectedUser])

/* AUTO SCROLL */

useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth"})
},[messages])

/* SEND MESSAGE */

async function sendMessage(){

if(!selectedUser || !content.trim()) return

const token = localStorage.getItem("token")

await fetch("http://localhost:3000/messages",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
otherUserId:selectedUser.id,
content
})
})

setContent("")

}

/* NO USER SELECTED */

if(!selectedUser){
return (
<div className="flex-1 flex items-center justify-center bg-white text-black">
Select a user to start chatting
</div>
)
}

/* CHAT UI */

return(

<div className="flex-1 flex flex-col bg-white text-black">

<div className="border-b p-3 font-bold">
Chat with {selectedUser.email}
</div>

{/* MESSAGES */}

<div className="flex-1 p-4 overflow-y-auto space-y-2">

{messages.map((msg)=>{

const isMe = msg.senderId === myId

return(
<div
key={msg.id}
className={`max-w-xs p-2 rounded ${
isMe
? "bg-black text-white ml-auto"
: "bg-gray-300 text-black"
}`}
>
{msg.content}
</div>
)

})}

<div ref={bottomRef}></div>

</div>

{/* INPUT */}

<div className="border-t p-4 flex gap-2">

<input
className="border p-2 flex-1 text-black"
value={content}
onChange={(e)=>setContent(e.target.value)}
placeholder="Type a message..."
/>

<button
className="bg-black text-white px-4"
onClick={sendMessage}
>
Send
</button>

</div>

</div>

)

}