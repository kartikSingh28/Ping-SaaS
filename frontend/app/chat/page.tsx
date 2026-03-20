"use client"

import { useState, useEffect } from "react"
import UsersSidebar from "./UserSidebar"
import ChatWindow from "./ChatWindow"

export default function ChatPage() {

  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser")

    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser))
    }
  }, [])

  function handleSelectUser(user: any) {
    setSelectedUser(user)
    localStorage.setItem("selectedUser", JSON.stringify(user))
  }

  return (
    <div className="h-screen flex bg-white">

      {/* LEFT SIDEBAR */}
      <UsersSidebar setSelectedUser={handleSelectUser} />

      {/* CHAT WINDOW */}
      <ChatWindow selectedUser={selectedUser} />

    </div>
  )
}