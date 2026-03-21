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
    <div className="h-screen flex items-center justify-center bg-gray-100">

  <div className="bg-white p-6 rounded-lg shadow-md w-80">

    <h1 className="text-xl font-bold mb-4 text-black">
      Signup
    </h1>

    <input
      className="border border-gray-300 p-2 w-full mb-3 rounded text-black placeholder-gray-500"
      placeholder="Name"
      value={name}
      onChange={(e)=>setName(e.target.value)}
    />

    <input
      className="border border-gray-300 p-2 w-full mb-3 rounded text-black placeholder-gray-500"
      placeholder="Email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
    />

    <input
      className="border border-gray-300 p-2 w-full mb-3 rounded text-black placeholder-gray-500"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
    />

    <button
      className="bg-black text-white p-2 w-full rounded hover:bg-gray-800 transition"
      onClick={handleSignup}
    >
      Signup
    </button>

  </div>

</div>
  )
}