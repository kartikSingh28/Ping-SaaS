"use client"

import { useEffect, useState } from "react"

export default function ChatPage(){

  const [messages,setMessages] = useState<any[]>([])
  const [content,setContent] = useState("")

  const conversationId = "d3915357-74f7-45b7-94d7-e80eb3cdd38c"

  async function fetchMessages(){

    const token = localStorage.getItem("token")

    const res = await fetch(
      `http://localhost:3000/messages/${conversationId}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    console.log("messages response:",data)

    if(Array.isArray(data)){
      setMessages(data)
    } 
    else if(Array.isArray(data.messages)){
      setMessages(data.messages)
    } 
    else {
      setMessages([])
    }
  }

  async function sendMessage(){

    if(!content.trim()) return

    const token = localStorage.getItem("token")

    const res = await fetch(
      "http://localhost:3000/messages",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          conversationId,
          content
        })
      }
    )

    const data = await res.json()

    console.log("send response:",data)

    const message = data.message || data

    if(message?.id){
      setMessages(prev => [...prev, message])
    }

    setContent("")
  }

  useEffect(()=>{
    fetchMessages()
  },[])

  return(

    <div className="h-screen flex flex-col">

      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

        {messages.map((m:any,index)=>(
          <div
            key={m.id || index}
            className="bg-gray-200 text-black p-2 rounded-lg w-fit max-w-xs"
          >
            {m.content}
          </div>
        ))}

      </div>

      {/* Input */}

      <div className="border-t p-4 flex gap-2">

        <input
          className="border p-2 flex-1 rounded"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          placeholder="Type a message..."
        />

        <button
          className="bg-black text-white px-4 rounded"
          onClick={sendMessage}
        >
          Send
        </button>

      </div>

    </div>
  )
}