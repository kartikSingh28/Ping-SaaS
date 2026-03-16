"use client"

import { useEffect, useState } from "react"

export default function UsersSidebar({ onSelectUser }: any) {

const [users,setUsers] = useState<any[]>([])

useEffect(()=>{

const token = localStorage.getItem("token")

fetch("http://localhost:3000/user/all",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
console.log("Users:",data)
setUsers(data)
})
.catch(err=>console.error("Fetch users error:",err))

},[])

function handleUserClick(user:any){

// save selected user
localStorage.setItem("selectedUser",JSON.stringify(user))

// update parent state
onSelectUser(user)

}

return(

<div className="w-64 border-r p-4 bg-white text-black">

<h2 className="font-bold mb-4">Users</h2>

{users.length === 0 && (
<p className="text-gray-500 text-sm">No users found</p>
)}

{users.map((u:any)=>(
<div
key={u.id}
className="p-2 cursor-pointer hover:bg-gray-300 border-b"
onClick={()=>handleUserClick(u)}
>
{u.email}
</div>
))}

</div>

)

}