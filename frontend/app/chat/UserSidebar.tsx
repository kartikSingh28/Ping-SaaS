"use client"

import { useEffect, useState } from "react"
import { Search, Settings } from "lucide-react"

const API_BASE = "http://localhost:3000"

export default function UserSidebar({ setSelectedUser }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setMe(payload)
    } catch {
      console.error("Token decode error")
    }

    fetch(`${API_BASE}/user/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          console.error("API ERROR:", text)
          return []
        }
        return res.json()
      })
      .then(data => setUsers(data))
      .catch(err => console.error("User fetch error:", err))
  }, [])

  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_BASE}/user/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      console.log("Uploaded:", data)

      setMe((prev: any) => ({
        ...prev,
        avatar: data.avatar
      }))
    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  const filteredUsers = users.filter(user => {
    const name = user.name || user.email || ""
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const myDisplayName = me?.name || me?.email?.split("@")[0] || "User"

  return (
    <div className="w-80 bg-zinc-950 text-white h-full flex flex-col border-r border-zinc-800">
      
      {/* PROFILE */}
      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer group relative">
            <img
              src={
                me?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${myDisplayName}`
              }
              className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-zinc-500 transition-all"
              alt="My avatar"
            />

            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* HEADER */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Messages
        </h3>
      </div>

      {/* USER LIST */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {filteredUsers.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-500 text-sm">No conversations found</p>
          </div>
        )}

        {filteredUsers.map(user => {
          const displayName = user.name || user.email?.split("@")[0]
          const avatarUrl =
            user.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`

          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={avatarUrl}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-600 transition-all"
                  alt={displayName}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-100 truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-zinc-600">now</span>
                </div>
                <p className="text-sm text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}