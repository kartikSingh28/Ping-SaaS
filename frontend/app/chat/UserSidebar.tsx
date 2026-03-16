"use client"

import { useEffect,useState } from "react"

export default function UsersSidebar({onSelectUser}:any){

const [users,setUsers] = useState([])

useEffect(()=>{

const token = localStorage.getItem("token")

fetch("http://localhost:3000/users",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>setUsers(data))

},[])

return(

  <div className="w-64 border-r p-4">

   <h2 className="font-bold mb-4">Users</h2>

{users.map((u:any)=>(
<div
key={u.id}
className="p-2 cursor-pointer hover:bg-gray-200"
onClick={()=>onSelectUser(u)}
>
{u.email} </div>
))}

  </div>

)

}
