"use client"

import { useEffect, useState } from "react"

export default function UserSidebar({ setSelectedUser }: any) {

  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")

    fetch("http://localhost:3000/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("USERS:", data) // 🔍 debug
        setUsers(data)
      })
      .catch(err => console.error("User fetch error:", err))
  }, [])

  return (
    <div className="w-64 bg-black text-white h-full overflow-y-auto">

      <div className="p-4 font-bold text-lg border-b border-gray-700">
        Chats
      </div>

      {users.map(user => (
        <div
          key={user.id}
          onClick={() => setSelectedUser(user)}
          className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition"
        >

          {/* AVATAR */}
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
            }
            className="w-10 h-10 rounded-full"
          />

          {/* USER INFO */}
          <div className="flex flex-col">
            <span className="font-medium">
              {user.name}
            </span>

            <span className="text-xs text-gray-400 truncate max-w-[150px]">
              {user.email}
            </span>
          </div>

        </div>
      ))}

    </div>
  )
}