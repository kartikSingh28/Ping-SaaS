"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { useSocket } from "../context/SocketContext"

const API_BASE = "http://localhost:3000"

export default function ChatWindow({ selectedUser }: any) {
  const { socket } = useSocket()

  const [content, setContent] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [myId, setMyId] = useState("")
  const [myName, setMyName] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<"NORMAL" | "STEALTH">("NORMAL")
  const [isToggling, setIsToggling] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<any>(null)
  const conversationIdRef = useRef<string | null>(null)

  // ── GET MY ID + NAME ────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setMyId(payload.userId)
    } catch {
      console.error("Token decode error")
      return
    }

    fetch(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMyName(data.name || data.email?.split("@")[0] || ""))
      .catch(() => {})
  }, [])

  // ── SOCKET LISTENERS ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !myId) return

    function handleNewMessage(message: any) {
      if (message.conversationId !== conversationIdRef.current) return
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      if (message.isEphemeral) {
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== message.id))
        }, 60 * 1000)
      }
    }

    function handleModeChanged({ conversationId: incomingId, mode: newMode }: any) {
      if (incomingId !== conversationIdRef.current) return
      setMode(newMode)
      if (newMode === "STEALTH") {
        setMessages(prev => prev.filter(m => m.isEphemeral))
      } else {
        const token = localStorage.getItem("token")
        fetch(`${API_BASE}/messages/${incomingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setMessages([...(data?.data || [])].reverse()))
      }
    }

    function handleTypingStart({ conversationId: incomingId, userId, name }: any) {
      if (incomingId !== conversationIdRef.current) return
      if (userId === myId) return
      setTypingUser(name)
    }

    function handleTypingStop({ conversationId: incomingId, userId }: any) {
      if (incomingId !== conversationIdRef.current) return
      if (userId === myId) return
      setTypingUser(null)
    }

    socket.on("new_message", handleNewMessage)
    socket.on("mode_changed", handleModeChanged)
    socket.on("user_typing", handleTypingStart)
    socket.on("user_stop_typing", handleTypingStop)

    return () => {
      socket.off("new_message", handleNewMessage)
      socket.off("mode_changed", handleModeChanged)
      socket.off("user_typing", handleTypingStart)
      socket.off("user_stop_typing", handleTypingStop)
    }
  }, [socket, myId])

  // ── LOAD CHAT ───────────────────────────────────────────────────────────────
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
          body: JSON.stringify({ otherUserId: selectedUser.id })
        })

        const raw = await res.json()
        if (!res.ok) return

        const convoId = raw?.data?.conversationId
        const conversationMode = raw?.data?.mode || "NORMAL"
        if (!convoId) return

        conversationIdRef.current = convoId
        setConversationId(convoId)
        setMode(conversationMode)
        setTypingUser(null)
        setMessages([])

        socket?.emit("join_conversation", convoId)

        const msgRes = await fetch(`${API_BASE}/messages/${convoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const msgRaw = await msgRes.json()
        setMessages([...(msgRaw?.data || [])].reverse())

      } catch (err) {
        console.error("Chat load error:", err)
        setMessages([])
      }
    }

    loadChat()
  }, [selectedUser, myId, socket])

  // ── AUTO SCROLL ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── TYPING ──────────────────────────────────────────────────────────────────
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setContent(value)

    if (!socket || !conversationId) return

    if (value.trim() === "") {
      if (isTyping) {
        socket.emit("typing_stop", { conversationId, userId: myId })
        setIsTyping(false)
        clearTimeout(timeoutRef.current)
      }
      return
    }

    if (!isTyping) {
      socket.emit("typing_start", {
        conversationId,
        userId: myId,
        name: myName
      })
      setIsTyping(true)
    }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId, userId: myId })
      setIsTyping(false)
    }, 1500)
  }

  // ── SEND MESSAGE ────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!selectedUser || !content.trim() || !conversationId) return

    const token = localStorage.getItem("token")
    const tempId = `temp-${Date.now()}`

    const tempMessage = {
      id: tempId,
      content,
      senderId: myId,
      conversationId,
      isEphemeral: mode === "STEALTH",
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, tempMessage])
    setContent("")

    if (isTyping) {
      socket?.emit("typing_stop", { conversationId, userId: myId })
      setIsTyping(false)
      clearTimeout(timeoutRef.current)
    }

    try {
      await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: selectedUser.id, content })
      })
    } catch (err) {
      console.error("Send error:", err)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── TOGGLE STEALTH ──────────────────────────────────────────────────────────
  async function toggleStealthMode() {
    if (!conversationId) return
    const token = localStorage.getItem("token")
    try {
      setIsToggling(true)
      const res = await fetch(
        `${API_BASE}/conversations/${conversationId}/toggle-stealth`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      )
      const raw = await res.json()
      if (!res.ok) return

      const updatedMode = raw?.data?.mode
      setMode(updatedMode)

      if (updatedMode === "NORMAL") {
        const msgRes = await fetch(`${API_BASE}/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const msgRaw = await msgRes.json()
        setMessages([...(msgRaw?.data || [])].reverse())
      } else {
        setMessages(prev => prev.filter(m => m.isEphemeral))
      }
    } catch (err) {
      console.error("Toggle stealth error:", err)
    } finally {
      setIsToggling(false)
    }
  }

  // ── EMPTY STATE ─────────────────────────────────────────────────────────────
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900 text-zinc-400">
        Select a conversation
      </div>
    )
  }

  const displayName = selectedUser.name || selectedUser.email?.split("@")[0]

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-zinc-900">

      {/* HEADER */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-700">
        <img
          src={selectedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`}
          className="w-10 h-10 rounded-full"
          alt={displayName}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold">{displayName}</h2>
            {mode === "STEALTH" && (
              <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full font-semibold tracking-wide">
                STEALTH
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">{selectedUser.email}</p>
        </div>
        <button
          onClick={toggleStealthMode}
          disabled={isToggling}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition
            ${mode === "STEALTH"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-zinc-700 hover:bg-zinc-600 text-white"}
            ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isToggling ? "..." : mode === "STEALTH" ? "Disable Stealth" : "Enable Stealth"}
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-6 overflow-y-auto space-y-3">
        {messages.map(msg => {
          const isMe = String(msg.senderId) === String(myId)
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[70%] break-words text-sm
                ${isMe ? "bg-white text-black" : "bg-zinc-800 text-white"}`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* TYPING INDICATOR */}
      <div className="px-6 h-6 flex items-center">
        {typingUser && (
          <p className="text-xs text-zinc-400 italic">
            {typingUser} is typing...
          </p>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-zinc-700 flex gap-2">
        <input
          value={content}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg outline-none text-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-white px-4 rounded-lg hover:bg-zinc-200 transition flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}