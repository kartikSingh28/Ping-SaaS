"use client"

import { useState, useEffect } from "react"
import UsersSidebar from "./UserSidebar"
import ChatWindow from "./ChatWindow"

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("selectedUser")
      if (savedUser) {
        setSelectedUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error("Failed to parse saved user:", err)
      localStorage.removeItem("selectedUser")
    }
  }, [])

  function handleSelectUser(user: any) {
    setSelectedUser(user)
    localStorage.setItem("selectedUser", JSON.stringify(user))
  }

  return (
    <div className="h-screen flex bg-zinc-950">
      <UsersSidebar setSelectedUser={handleSelectUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  )
}