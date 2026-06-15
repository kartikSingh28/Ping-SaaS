"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useSocket } from "../context/SocketContext"  // ← adjust path if needed

const API_BASE = "http://localhost:3000"

export default function UserSidebar({ setSelectedUser }: any) {
  const { onlineUsers } = useSocket()  // ← replaces the whole socket useEffect
  const [users, setUsers] = useState<any[]>([])
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

    fetch(`${API_BASE}/user/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Users fetch error:", err))
  }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("avatar", file)
    const token = localStorage.getItem("token")
    const res = await fetch(`${API_BASE}/user/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    const data = await res.json()
    setMe((prev: any) => ({ ...prev, avatar: data.avatar }))
  }

  const filteredUsers = users.filter(user =>
    (user.name || user.email || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const myDisplayName = me?.name || me?.email?.split("@")[0] || "User"

  return (
    <div className="w-80 bg-zinc-950 text-white h-full flex flex-col border-r border-zinc-800">

      {/* PROFILE */}
      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <img
              src={me?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${myDisplayName}`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700"
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

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-500 text-sm">No users found</p>
          </div>
        )}

        {filteredUsers.map(user => {
          const displayName = user.name || user.email?.split("@")[0]
          const avatarUrl =
            user.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`
          const isOnline = onlineUsers.includes(String(user.id))

          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 cursor-pointer transition"
            >
              <div className="relative">
                <img
                  src={avatarUrl}
                  className="w-12 h-12 rounded-full"
                  alt={displayName}
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white truncate block">{displayName}</span>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}