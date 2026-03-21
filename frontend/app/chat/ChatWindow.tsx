"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { Send } from "lucide-react"

const API_BASE = "http://localhost:3000"

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

  //  Get my ID
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

  //  Socket setup
  useEffect(() => {
    if (!myId) return

    const socket = io(API_BASE, {
      query: { userId: myId }
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Connected:", socket.id)
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

  //  Typing listeners
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

  //  Load chat
  useEffect(() => {
    if (!selectedUser || !myId) return
    if (selectedUser.id === myId) return

    const token = localStorage.getItem("token")

    async function loadChat() {
      try {
        const res = await fetch(`${API_BASE}/conversations/private`, {
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

        // leave old
        if (conversationId) {
          socketRef.current?.emit("leave_conversation", conversationId)
        }

        setConversationId(convoId)

        // join new
        if (socketRef.current?.connected) {
          socketRef.current.emit("join_conversation", convoId)
        } else {
          socketRef.current?.once("connect", () => {
            socketRef.current?.emit("join_conversation", convoId)
          })
        }

        const msgRes = await fetch(`${API_BASE}/messages/${convoId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

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

  //  Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  //  Typing handler
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

  //  Send message
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
      await fetch(`${API_BASE}/messages`, {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900 text-zinc-400">
        Select a conversation
      </div>
    )
  }

  const displayName = selectedUser.name || selectedUser.email?.split("@")[0]

  return (
    <div className="flex-1 flex flex-col bg-zinc-900">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-700">
        <img
          src={
            selectedUser.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`
          }
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h2 className="text-white">{displayName}</h2>
          <p className="text-xs text-zinc-400">{selectedUser.email}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-6 overflow-y-auto space-y-3">
        {messages.map(msg => {
          const isMe = String(msg.senderId) === String(myId)

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : ""}`}>
              <div className={`px-4 py-2 rounded-xl ${isMe ? "bg-white text-black" : "bg-zinc-800 text-white"}`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* TYPING */}
      {typingUser && (
        <div className="px-6 text-sm text-zinc-400">
          {typingUser} is typing...
        </div>
      )}

      {/* INPUT */}
      <div className="p-4 border-t border-zinc-700 flex gap-2">
        <input
          value={content}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-white px-4 rounded">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}