"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export default function ChatWindow({ selectedUser }: any) {

  const [content, setContent] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [myId, setMyId] = useState("")
  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  /* GET MY USER ID */
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        console.log("MY ID:", payload.userId)
        setMyId(payload.userId)
      } catch {
        console.error("Token decode error")
      }
    }
  }, [])

  /* CONNECT SOCKET */
  useEffect(() => {

    if (!myId) return

    socketRef.current = io("http://localhost:3000", {
      query: { userId: myId }
    })

    socketRef.current.on("connect", () => {
      console.log("✅ Connected:", socketRef.current?.id)
    })

    socketRef.current.on("new_message", (message: any) => {

      setMessages(prev => {

        // remove temp duplicate
        const filtered = prev.filter(m =>
          !(
            m.id.toString().startsWith("temp") &&
            m.content === message.content &&
            String(m.senderId) === String(message.senderId)
          )
        )

        // avoid duplicate real message
        const exists = filtered.some(m => m.id === message.id)
        if (exists) return filtered

        return [...filtered, message]
      })

    })

    return () => {
      socketRef.current?.disconnect()
    }

  }, [myId])

  /* LOAD CHAT */
  useEffect(() => {

    if (!selectedUser || !myId) return
    if (selectedUser.id === myId) return

    const token = localStorage.getItem("token")

    async function loadChat() {
      try {

        const res = await fetch("http://localhost:3000/conversations/private", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            otherUserId: selectedUser.id
          })
        })

        const raw = await res.json()
        if (!res.ok) return

        const convoId = raw?.data?.conversationId
        if (!convoId) return

        socketRef.current?.emit("join_conversation", convoId)

        const msgRes = await fetch(
          `http://localhost:3000/messages/${convoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const msgRaw = await msgRes.json()
        if (!msgRes.ok) return

        setMessages(msgRaw?.data || [])

      } catch (err) {
        console.error("Chat load error:", err)
        setMessages([])
      }
    }

    loadChat()

  }, [selectedUser, myId])

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* SEND MESSAGE */
  async function sendMessage() {

    if (!selectedUser || !content.trim()) return

    const token = localStorage.getItem("token")

    const tempMessage = {
      id: "temp-" + Date.now(),
      content,
      senderId: myId
    }

    // instant UI
    setMessages(prev => [...prev, tempMessage])
    setContent("")

    try {
      await fetch("http://localhost:3000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          otherUserId: selectedUser.id,
          content
        })
      })

      // socket will sync real message

    } catch (err) {
      console.error("Send error:", err)
    }
  }

  /* NO USER */
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-black">
        Select a user to start chatting
      </div>
    )
  }

  /* UI */
  return (
    <div className="flex-1 flex flex-col bg-white text-black">

      <div className="border-b p-3 font-bold">
        Chat with {selectedUser.email}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">

        {messages.map((msg) => {

          // 🔥 FINAL FIX — ROBUST COMPARISON
          const isMe =
            msg?.senderId?.toString().trim().toLowerCase() ===
            myId?.toString().trim().toLowerCase()

          console.log("COMPARE:", msg.senderId, myId, isMe)

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  isMe
                    ? "bg-black text-white rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
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
          onChange={(e) => setContent(e.target.value)}
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