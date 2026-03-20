"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export default function ChatWindow({ selectedUser }: any) {

  const [content, setContent] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [myId, setMyId] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const timeoutRef = useRef<any>(null)

  /* GET MY USER ID */
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setMyId(payload.userId)
      } catch {
        console.error("Token decode error")
      }
    }
  }, [])

  /* CONNECT SOCKET */
  useEffect(() => {
    if (!myId) return

    const socket = io("http://localhost:3000", {
      query: { userId: myId }
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log(" Connected:", socket.id)
    })

    socket.on("new_message", (message: any) => {
      setMessages(prev => {

        const filtered = prev.filter(m =>
          !(
            m.id.toString().startsWith("temp") &&
            m.content === message.content &&
            String(m.senderId) === String(message.senderId)
          )
        )

        const exists = filtered.some(m => m.id === message.id)
        if (exists) return filtered

        return [...filtered, message]
      })
    })

    return () => {
      socket.disconnect()
    }

  }, [myId])

  /* TYPING LISTENERS */
  useEffect(() => {
    if (!socketRef.current) return

    const socket = socketRef.current

    const handleTyping = ({ conversationId: incomingId, userId, name }: any) => {
      if (incomingId === conversationId && userId !== myId) {
        setTypingUser(name)
      }
    }

    const handleStop = ({ conversationId: incomingId, userId }: any) => {
      if (incomingId === conversationId && userId !== myId) {
        setTypingUser(null)
      }
    }

    socket.on("user_typing", handleTyping)
    socket.on("user_stop_typing", handleStop)

    return () => {
      socket.off("user_typing", handleTyping)
      socket.off("user_stop_typing", handleStop)
    }

  }, [conversationId, myId])

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

        if (conversationId) {
          socketRef.current?.emit("leave_conversation", conversationId)
        }

        setConversationId(convoId)

        if (socketRef.current?.connected) {
          socketRef.current.emit("join_conversation", convoId)
        } else {
          socketRef.current?.once("connect", () => {
            socketRef.current?.emit("join_conversation", convoId)
          })
        }

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

  /* HANDLE TYPING */
  const handleTyping = (e: any) => {
    const value = e.target.value
    setContent(value)

    if (!socketRef.current || !conversationId) return
    if (value.trim() === "") return

    if (!isTyping) {
      socketRef.current.emit("typing_start", {
        conversationId,
        userId: myId,
        name: selectedUser.name || selectedUser.email
      })
      setIsTyping(true)
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing_stop", {
        conversationId,
        userId: myId
      })
      setIsTyping(false)
    }, 1000)
  }

  /* SEND MESSAGE */
  async function sendMessage() {

    if (!selectedUser || !content.trim()) return

    const token = localStorage.getItem("token")

    const tempMessage = {
      id: "temp-" + Date.now(),
      content,
      senderId: myId
    }

    setMessages(prev => [...prev, tempMessage])
    setContent("")

    socketRef.current?.emit("typing_stop", {
      conversationId,
      userId: myId
    })
    setIsTyping(false)

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

    } catch (err) {
      console.error("Send error:", err)
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-black">
        Select a user to start chatting
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-black">

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b p-3">

        <img
          src={
            selectedUser.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`
          }
          className="w-8 h-8 rounded-full"
        />

        <div>
          <p className="font-bold">{selectedUser.name}</p>
          <p className="text-xs text-gray-400">{selectedUser.email}</p>
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">

        {messages.map((msg) => {

          const isMe =
            msg?.senderId?.toString().trim().toLowerCase() ===
            myId?.toString().trim().toLowerCase()

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
                {!isMe && (
                  <p className="text-xs text-gray-500 mb-1">
                    {msg.sender?.profile?.displayName || "User"}
                  </p>
                )}

                {msg.content}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* TYPING */}
      {typingUser && (
        <p className="text-sm text-gray-400 px-4 pb-2 italic">
          {typingUser} is typing...
        </p>
      )}

      {/* INPUT */}
      <div className="border-t p-4 flex gap-2">

        <input
          className="border p-2 flex-1 text-black"
          value={content}
          onChange={handleTyping}
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