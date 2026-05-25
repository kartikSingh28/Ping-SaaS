"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { Send } from "lucide-react"

const API_BASE = "http://localhost:3000"

export default function ChatWindow({ selectedUser }: any) {

  const [content, setContent] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [myId, setMyId] = useState("")

  const [conversationId, setConversationId] =
    useState<string | null>(null)

  // STEALTH MODE STATE
  const [mode, setMode] =
    useState<"NORMAL" | "STEALTH">("NORMAL")

  const [isToggling, setIsToggling] =
    useState(false)

  const socketRef =
    useRef<Socket | null>(null)

  const bottomRef =
    useRef<HTMLDivElement | null>(null)

  const [isTyping, setIsTyping] =
    useState(false)

  const [typingUser, setTypingUser] =
    useState<string | null>(null)

  const timeoutRef = useRef<any>(null)

  // =========================================================
  // GET MY ID
  // =========================================================

  useEffect(() => {

    const token =
      localStorage.getItem("token")

    if (token) {
      try {

        const payload =
          JSON.parse(
            atob(token.split(".")[1])
          )

        setMyId(payload.userId)

      } catch {

        console.error(
          "Token decode error"
        )
      }
    }

  }, [])

  // =========================================================
  // SOCKET SETUP
  // =========================================================

  useEffect(() => {

    if (!myId) return

    const socket = io(API_BASE, {
      query: { userId: myId }
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log(
        "Connected:",
        socket.id
      )
    })

    socket.on(
      "new_message",
      (message: any) => {

        setMessages(prev => {

          const filtered =
            prev.filter(m =>
              !(
                m.id
                  .toString()
                  .startsWith("temp") &&

                m.content ===
                  message.content &&

                String(m.senderId) ===
                  String(message.senderId)
              )
            )

          const exists =
            filtered.some(
              m => m.id === message.id
            )

          if (exists) return filtered

          return [...filtered, message]
        })
      }
    )

    return () => {
      socket.disconnect()
    }

  }, [myId])

  // =========================================================
  // TYPING LISTENERS
  // =========================================================

  useEffect(() => {

    if (!socketRef.current) return

    const socket =
      socketRef.current

    const handleTyping = ({
      conversationId: incomingId,
      userId,
      name
    }: any) => {

      if (
        incomingId === conversationId &&
        userId !== myId
      ) {
        setTypingUser(name)
      }
    }

    const handleStop = ({
      conversationId: incomingId,
      userId
    }: any) => {

      if (
        incomingId === conversationId &&
        userId !== myId
      ) {
        setTypingUser(null)
      }
    }

    socket.on(
      "user_typing",
      handleTyping
    )

    socket.on(
      "user_stop_typing",
      handleStop
    )

    return () => {

      socket.off(
        "user_typing",
        handleTyping
      )

      socket.off(
        "user_stop_typing",
        handleStop
      )
    }

  }, [conversationId, myId])

  // =========================================================
  // LOAD CHAT
  // =========================================================

  useEffect(() => {

    if (!selectedUser || !myId)
      return

    if (selectedUser.id === myId)
      return

    const token =
      localStorage.getItem("token")

    async function loadChat() {

      try {

        const res = await fetch(
          `${API_BASE}/conversations/private`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              otherUserId:
                selectedUser.id
            })
          }
        )

        const raw =
          await res.json()

        if (!res.ok) return

        // =================================================
        // CONVERSATION DATA
        // =================================================

        const convoId =
          raw?.data?.conversationId

        const conversationMode =
          raw?.data?.mode || "NORMAL"

        setMode(conversationMode)

        if (!convoId) return

        // leave old room
        if (conversationId) {

          socketRef.current?.emit(
            "leave_conversation",
            conversationId
          )
        }

        setConversationId(convoId)

        // join new room
        if (
          socketRef.current?.connected
        ) {

          socketRef.current.emit(
            "join_conversation",
            convoId
          )

        } else {

          socketRef.current?.once(
            "connect",
            () => {

              socketRef.current?.emit(
                "join_conversation",
                convoId
              )
            }
          )
        }

        // =================================================
        // LOAD MESSAGES
        // =================================================

        const msgRes = await fetch(
          `${API_BASE}/messages/${convoId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

        const msgRaw =
          await msgRes.json()

        if (!msgRes.ok) return

        setMessages(
          msgRaw?.data || []
        )

      } catch (err) {

        console.error(
          "Chat load error:",
          err
        )

        setMessages([])
      }
    }

    loadChat()

  }, [selectedUser, myId])

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {

    bottomRef.current
      ?.scrollIntoView({
        behavior: "smooth"
      })

  }, [messages])

  // =========================================================
  // TYPING HANDLER
  // =========================================================

  const handleTyping = (e: any) => {

    const value =
      e.target.value

    setContent(value)

    if (
      !socketRef.current ||
      !conversationId
    ) return

    if (value.trim() === "")
      return

    if (!isTyping) {

      socketRef.current.emit(
        "typing_start",
        {
          conversationId,
          userId: myId,

          name:
            selectedUser.name ||
            selectedUser.email
        }
      )

      setIsTyping(true)
    }

    if (timeoutRef.current)
      clearTimeout(
        timeoutRef.current
      )

    timeoutRef.current =
      setTimeout(() => {

        socketRef.current?.emit(
          "typing_stop",
          {
            conversationId,
            userId: myId
          }
        )

        setIsTyping(false)

      }, 1000)
  }

  // =========================================================
  // TOGGLE STEALTH MODE
  // =========================================================

  async function toggleStealthMode() {

    if (!conversationId)
      return

    const token =
      localStorage.getItem("token")

    try {

      setIsToggling(true)

      const res = await fetch(
        `${API_BASE}/conversations/${conversationId}/toggle-stealth`,
        {
          method: "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const text = await res.text()

console.log("RAW RESPONSE:", text)

const raw = JSON.parse(text)

      if (!res.ok) {
        console.error(raw)
        return
      }

      const updatedMode =
        raw?.data?.mode

      setMode(updatedMode)

    } catch (err) {

      console.error(
        "Toggle stealth error:",
        err
      )

    } finally {

      setIsToggling(false)
    }
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function sendMessage() {

    if (
      !selectedUser ||
      !content.trim()
    ) return

    const token =
      localStorage.getItem("token")

    const tempMessage = {
      id:
        "temp-" + Date.now(),

      content,
      senderId: myId,

      // OPTIONAL
      isEphemeral:
        mode === "STEALTH"
    }

    setMessages(prev => [
      ...prev,
      tempMessage
    ])

    setContent("")

    socketRef.current?.emit(
      "typing_stop",
      {
        conversationId,
        userId: myId
      }
    )

    setIsTyping(false)

    try {

      await fetch(
        `${API_BASE}/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            otherUserId:
              selectedUser.id,

            content
          })
        }
      )

    } catch (err) {

      console.error(
        "Send error:",
        err
      )
    }
  }

  // =========================================================
  // ENTER SEND
  // =========================================================

  const handleKeyPress = (
    e: React.KeyboardEvent
  ) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault()
      sendMessage()
    }
  }

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (!selectedUser) {

    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900 text-zinc-400">
        Select a conversation
      </div>
    )
  }

  const displayName =
    selectedUser.name ||
    selectedUser.email
      ?.split("@")[0]

  // =========================================================
  // UI
  // =========================================================

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

        {/* USER INFO */}

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <h2 className="text-white font-semibold">
              {displayName}
            </h2>

            {mode === "STEALTH" && (
              <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full font-semibold tracking-wide">
                STEALTH
              </span>
            )}

          </div>

          <p className="text-xs text-zinc-400">
            {selectedUser.email}
          </p>

        </div>

        {/* TOGGLE BUTTON */}

        <button
          onClick={toggleStealthMode}

          disabled={isToggling}

          className={`
            px-4 py-2 rounded-xl
            text-xs font-semibold transition

            ${
              mode === "STEALTH"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-zinc-700 hover:bg-zinc-600 text-white"
            }

            ${
              isToggling
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
        >

          {
            isToggling
              ? "..."
              : mode === "STEALTH"
                ? "Disable Stealth"
                : "Enable Stealth"
          }

        </button>

      </div>

      {/* MESSAGES */}

      <div className="flex-1 p-6 overflow-y-auto space-y-3">

        {messages.map(msg => {

          const isMe =
            String(msg.senderId) ===
            String(myId)

          return (

            <div
              key={msg.id}

              className={`
                flex
                ${isMe ? "justify-end" : ""}
              `}
            >

              <div
                className={`
                  px-4 py-2 rounded-xl

                  ${
                    isMe
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-white"
                  }
                `}
              >

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

        <button
          onClick={sendMessage}

          className="bg-white px-4 rounded"
        >
          <Send size={16} />
        </button>

      </div>

    </div>
  )
}