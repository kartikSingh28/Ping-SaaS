"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage(){

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [name,setName] = useState("")

  async function handleSignup(){

    const res = await fetch("http://localhost:3000/user/signup",{
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

    const data = await res.json()

    if(res.ok){
      alert("Signup successful!")
      router.push("/login")
    } else {
      alert(data.message || "Signup failed")
    }
  }

  return(
    <div className="h-screen flex items-center justify-center bg-white">

      <div className="p-6 shadow rounded w-80">

        <h1 className="text-xl font-bold mb-4">Signup</h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Password"
          value={password}
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