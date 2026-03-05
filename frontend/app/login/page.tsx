"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

    const res = await fetch("http://localhost:3000/user/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();
      console.log(data);   

    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/chat");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">

      <div className="p-6 shadow rounded w-80">

        <h1 className="text-xl font-bold mb-4">
          Login
        </h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-black text-white p-2 w-full"
          onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>
  );
}