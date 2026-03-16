"use client"

import { useState } from "react"

export default function ChatWindow({selectedUser}:any){

const [content,setContent] = useState("")

async function sendMessage(){

if(!selectedUser) return

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

if(!selectedUser){
return <div className="flex-1 flex items-center justify-center">
Select a user to start chatting

  </div>
 }

return(

  <div className="flex-1 flex flex-col">

   <div className="border-b p-3 font-bold">
    Chat with {selectedUser.email}
   </div>

   <div className="flex-1 p-4">
     Messages will appear here
   </div>

   <div className="border-t p-4 flex gap-2">

```
 <input
   className="border p-2 flex-1"
   value={content}
   onChange={(e)=>setContent(e.target.value)}
 />

 <button
   className="bg-blue-500 text-white px-4"
   onClick={sendMessage}
 >
   Send
 </button>
```

   </div>

  </div>

)

}
