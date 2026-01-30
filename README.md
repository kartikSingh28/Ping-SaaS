<h1 align="center">🚀 Ping</h1>
<h3 align="center">Scalable Real-Time Messaging Backend</h3>

<p align="center">
<b>Production-style chat backend engineered for low latency, clean architecture, and horizontal scalability.</b><br/>
Inspired by Slack • Discord • WhatsApp<br/>
Focused on <b>backend system design</b>, not UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-indigo" />
  <img src="https://img.shields.io/badge/Redis-Realtime-red" />
  <img src="https://img.shields.io/badge/Socket.IO-WebSockets-black" />
  <img src="https://img.shields.io/badge/BullMQ-Async-orange" />
</p>

---

<h2>✨ Capabilities</h2>

<ul>
  <li>⚡ Realtime WebSocket messaging</li>
  <li>💬 1–1 & group conversations</li>
  <li>🔐 Role-based membership & authorization</li>
  <li>🗄️ Persistent + ephemeral (stealth) messages</li>
  <li>🧵 Background async processing</li>
  <li>📈 Horizontally scalable architecture</li>
</ul>

---

<h2>🧠 Architecture</h2>

<pre align="center">
Clients
   ↓
Express API + Socket.IO (stateless)
   ↓
PostgreSQL (durable) | Redis (ephemeral) | BullMQ (workers)
</pre>

<p align="center">
<b>Principle:</b> Database owns state • Sockets deliver • Workers process heavy tasks
</p>

---

<h2>🔑 Core Features</h2>

<h4>🔐 Authentication</h4>
<ul>
  <li>JWT-based auth</li>
  <li>bcrypt password hashing</li>
  <li>User profile layer</li>
</ul>

<h4>💬 Conversations</h4>
<ul>
  <li>Conversation-centric model (no direct user messaging)</li>
  <li>Unified support for 1–1 + groups</li>
  <li>Role-based access control</li>
</ul>

<h4>📩 Messaging</h4>
<ul>
  <li>PostgreSQL + Prisma ORM</li>
  <li>Type-safe queries</li>
  <li>Indexed & pagination-ready retrieval</li>
</ul>

<h4>⚡ Realtime</h4>
<ul>
  <li>Socket.IO rooms by conversationId</li>
  <li>Instant broadcasting</li>
  <li>Stateless servers</li>
</ul>

<h4>🕵️ Stealth Mode (Ephemeral)</h4>
<ul>
  <li>Redis-only storage with TTL</li>
  <li>Automatic expiration</li>
  <li>No DB writes</li>
</ul>

<h4>🧵 Async Processing</h4>
<ul>
  <li>BullMQ job workers</li>
  <li>AI-powered group summaries</li>
  <li>Cold tasks off request path</li>
</ul>

---

<h2>🗄️ Data Model</h2>

<p>
User • UserProfile • Conversation • ConversationMember • Message • GroupSummary
</p>

<p>
Single conversation abstraction → cleaner schema → easier scaling
</p>

---

<h2>⚙️ Engineering Decisions</h2>

<ul>
  <li>Conversation-first design → simpler authorization</li>
  <li>Database as source of truth → reliability</li>
  <li>Redis for ephemeral → fast + auto cleanup</li>
  <li>BullMQ for heavy tasks → non-blocking APIs</li>
  <li>Stateless services → horizontal scaling</li>
</ul>

---

<h2>📈 Scaling Strategy</h2>

<ul>
  <li>Multi-instance Express servers</li>
  <li>Redis pub/sub for cross-node WebSocket sync</li>
  <li>Cursor pagination</li>
  <li>Async workers for cold paths</li>
  <li>Shardable conversations</li>
</ul>

<p><b>Designed to handle thousands of concurrent sockets with low latency.</b></p>

---

<h2>🧰 Tech Stack</h2>

<b>Backend:</b> Node.js • TypeScript • Express • Prisma • PostgreSQL  
<b>Realtime:</b> Socket.IO • Redis • BullMQ  
<b>Security:</b> JWT • bcrypt • Zod  

---

<h2>🚀 Local Setup</h2>

<pre>
git clone &lt;repo&gt;
npm install
npm run dev
</pre>

.env
<pre>
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
</pre>

---

<h2>💡 Summary</h2>

<p>
Ping demonstrates scalable backend architecture, realtime communication,
distributed state separation, and async job processing —
modeled after modern messaging systems like Slack/Discord.
</p>

<p align="center">
⭐ If you like the project, consider starring it!
</p>
