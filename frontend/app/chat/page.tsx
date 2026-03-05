"use client"

import { useEffect, useState } from "react"

export default function ChatPage(){

  const [messages,setMessages] = useState([])
  const [content,setContent] = useState("")

  const conversationId = "PUT_ONE_CONVERSATION_ID_HERE"

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

    setMessages(data.messages || data)
  }

  async function sendMessage(){

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

    const msg = await res.json()

    setMessages(prev => [...prev,msg])

    setContent("")
  }

  useEffect(()=>{
    fetchMessages()
  },[])

  return(

    <div className="h-screen flex flex-col">

      <div className="flex-1 overflow-y-auto p-4">

        {messages.map((m:any)=>(
          <div key={m.id}>
            {m.content}
          </div>
        ))}

      </div>

      <div className="border-t p-4 flex gap-2">

        <input
          className="border p-2 flex-1"
          value={content}
          onChange={(e)=>setContent(e.target.value)}
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