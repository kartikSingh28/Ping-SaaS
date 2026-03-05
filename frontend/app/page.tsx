"use client"

import { useRouter } from "next/navigation"

export default function Home(){

  const router = useRouter()

  return(

    <div className="h-screen flex flex-col items-center justify-center gap-4">

      <h1 className="text-4xl font-bold">
        Ping
      </h1>

      <p className="text-gray-500">
        Realtime Messaging Platform
      </p>

      <div className="flex gap-4">

        <button
          className="bg-black text-white px-4 py-2"
          onClick={()=>router.push("/login")}
        >
          Login
        </button>

        <button
          className="border px-4 py-2"
          onClick={()=>router.push("/signup")}
        >
          Signup
        </button>

      </div>

    </div>
  )
}