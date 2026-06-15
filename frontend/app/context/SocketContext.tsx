"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react"
import { io, Socket } from "socket.io-client"

const API_BASE = "http://localhost:3000"

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: []
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    let userId: string
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      userId = payload.userId
    } catch {
      console.error("Invalid token")
      return
    }

    const newSocket = io(API_BASE, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5
    })

    // Auto-join all existing conversation rooms on every connect/reconnect
    const handleConnect = () => {
      console.log("Socket connected:", newSocket.id)

      fetch(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const conversations: any[] = data?.data || []
          conversations.forEach(c => {
            newSocket.emit("join_conversation", c.id)
          })
          console.log(`Auto-joined ${conversations.length} rooms`)
        })
        .catch(err => console.error("Auto-join failed:", err))
    }

    newSocket.on("connect", handleConnect)

    newSocket.on("online_users", (users: string[]) => {
      setOnlineUsers(users)
    })

    // Set socket as STATE not ref — so React re-renders
    // and ChatWindow always gets the real socket instance
    setSocket(newSocket)

    return () => {
      newSocket.off("connect", handleConnect)
      newSocket.disconnect()
      setSocket(null)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}