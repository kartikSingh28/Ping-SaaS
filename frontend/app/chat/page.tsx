"use client"

import { useState } from "react"
import UsersSidebar from "./UsersSidebar"
import ChatWindow from "./ChatWindow"

export default function ChatPage(){

const [selectedUser,setSelectedUser] = useState<any>(null)

return(


<div className="h-screen flex bg-white">

  {/* LEFT SIDEBAR */}

  <UsersSidebar onSelectUser={setSelectedUser} />

  {/* CHAT WINDOW */}

  <ChatWindow selectedUser={selectedUser} />

</div>
```

)

}
