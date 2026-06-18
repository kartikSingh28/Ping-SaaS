"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useSocket } from "../context/SocketContext"

const API_BASE = "http://localhost:3000"

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

export default function UserSidebar({ setSelectedUser }: any) {
  const { onlineUsers, socket } = useSocket()

  const [conversations, setConversations] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMe(data))
      .catch(err => console.error("Me fetch error:", err))

    fetchConversations(token)
  }, [])

  function fetchConversations(token: string) {
    fetch(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setConversations(data?.data || []))
      .catch(err => console.error("Conversations fetch error:", err))
  }

  // Refresh sidebar when a new message arrives
  useEffect(() => {
    if (!socket) return

    function handleNewMessage() {
      const token = localStorage.getItem("token")
      if (token) fetchConversations(token)
    }

    socket.on("new_message", handleNewMessage)
    return () => { socket.off("new_message", handleNewMessage) }
  }, [socket])

  // Refresh sidebar when a conversation is marked as read
  useEffect(() => {
    function handleConversationRead() {
      const token = localStorage.getItem("token")
      if (token) fetchConversations(token)
    }

    window.addEventListener("conversation_read", handleConversationRead)
    return () => window.removeEventListener("conversation_read", handleConversationRead)
  }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_BASE}/user/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      setMe((prev: any) => ({ ...prev, avatar: data.avatar }))
    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  const filtered = conversations.filter(conv => {
    const name = conv.otherUser?.name || conv.otherUser?.email || ""
    return name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  })

  const myDisplayName = me?.name || me?.email?.split("@")[0] || "User"

  return (
    <div className="w-80 bg-zinc-950 text-white h-full flex flex-col border-r border-zinc-800">

      {/* MY PROFILE */}
      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <img
              src={
                me?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(myDisplayName)}`
              }
              className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700"
              alt="Profile"
            />
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept="image/*"
            />
          </label>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-100 truncate">{myDisplayName}</p>
            <p className="text-xs text-zinc-500 truncate">{me?.email}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="p-4">
        <div className="flex items-center gap-2 bg-zinc-800/50 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none"
          />
        </div>
      </div>

      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Messages
        </h3>
      </div>

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-500 text-sm">No conversations yet</p>
          </div>
        )}

        {filtered.map((conv, index) => {
          const user = conv.otherUser

          const displayName =
            user?.name ||
            user?.email?.split("@")[0] ||
            "Unknown"

          const avatarUrl =
            user?.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`

          const isOnline = onlineUsers.includes(String(user?.id))

          const lastMsg = conv.lastMessage

          let preview = "No messages yet"

          if (lastMsg?.content) {
            preview = lastMsg.isMe
              ? `You: ${lastMsg.content}`
              : lastMsg.content

            if (preview.length > 35) {
              preview = preview.slice(0, 35) + "..."
            }
          }

          return (
            <div
              key={conv.conversationId || conv.id || index}
              onClick={() => {
                const selected = {
                  ...user,
                  conversationId: conv.conversationId || conv.id
                }
                localStorage.setItem("selectedUser", JSON.stringify(selected))
                setSelectedUser(selected)
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/70 cursor-pointer transition border-b border-zinc-900"
            >
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={displayName}
                />

                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
                )}
              </div>

              <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between">
  <span className="text-white font-medium truncate text-sm flex items-center gap-2">
    {displayName}

    {conv.unreadCount > 0 && (
      <span className="bg-zinc-600 text-zinc-100 text-[11px] font-semibold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 border border-zinc-500">
        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
      </span>
    )}
  </span>

  {lastMsg && (
    <span className="text-zinc-500 text-xs shrink-0 ml-2">
      {timeAgo(lastMsg.createdAt)}
    </span>
  )}
</div>

                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {preview}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}