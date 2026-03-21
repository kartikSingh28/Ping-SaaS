"use client"

import { useEffect, useState } from "react"

export default function UserSidebar({ setSelectedUser }: any) {

  const [users, setUsers] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) return

    // 🔥 decode current user
    const payload = JSON.parse(atob(token.split(".")[1]))
    setMe(payload)

    fetch("http://localhost:3000/user/all", {
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

  /* 🔥 HANDLE AVATAR UPLOAD */
  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:3000/user/upload-avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await res.json()

    console.log("Uploaded:", data)

    // 🔥 update UI instantly
    setMe((prev: any) => ({
      ...prev,
      avatar: data.avatar
    }))
  }

  return (
    <div className="w-64 bg-black text-white h-full overflow-y-auto">

      {/* 🔥 MY PROFILE */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">

        <label className="cursor-pointer">
          <img
            src={
              me?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${me?.email}`
            }
            className="w-10 h-10 rounded-full"
          />

          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </label>

        <div>
          <p className="font-medium">{me?.email}</p>
          <p className="text-xs text-gray-400">Click to change</p>
        </div>

      </div>

      {/* 🔥 CHAT LIST HEADER */}
      <div className="p-4 font-bold text-lg border-b border-gray-700">
        Chats
      </div>

      {users.length === 0 && (
        <p className="p-4 text-gray-400 text-sm">
          No users found
        </p>
      )}

      {users.map(user => {

        const displayName = user.name || user.email

        const avatarUrl =
          user.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`

        return (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition"
          >

            <img
              src={avatarUrl}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex flex-col">
              <span className="font-medium">
                {displayName}
              </span>

              <span className="text-xs text-gray-400 truncate max-w-[150px]">
                {user.email}
              </span>
            </div>

          </div>
        )
      })}

    </div>
  )
}