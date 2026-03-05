"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage(){

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [name,setName] = useState("")

  async function handleSignup(){

    await fetch("http://localhost:3000/user/signup",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        email,
        password,
        name
      })
    })

    router.push("/login")
  }

  return(

    <div className="h-screen flex items-center justify-center">

      <div className="p-6 shadow rounded w-80">

        <h1 className="text-xl font-bold mb-4">Signup</h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Name"
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="bg-black text-white p-2 w-full"
          onClick={handleSignup}
        >
          Signup
        </button>

      </div>

    </div>
  )
}