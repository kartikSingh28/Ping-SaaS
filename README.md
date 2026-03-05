
  <h1 align="center">🚀 Ping</h1>

<h3 align="center">
Scalable Real-Time Messaging Platform
</h3>

<p align="center">
Production-style chat system engineered for <b>low latency</b>, <b>clean architecture</b>, and <b>horizontal scalability</b>.<br/>
Inspired by Slack • Discord • WhatsApp
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Database-indigo?style=for-the-badge&logo=postgresql"/>
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socket.io"/>
  <img src="https://img.shields.io/badge/Next.js-Frontend-white?style=for-the-badge&logo=next.js"/>
  <img src="https://img.shields.io/badge/Redis-Realtime-red?style=for-the-badge&logo=redis"/>
  <img src="https://img.shields.io/badge/BullMQ-Workers-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Docker-Deployment-blue?style=for-the-badge&logo=docker"/>
</p>

---

# ✨ Overview

Ping is a **full-stack real-time messaging platform** designed to demonstrate modern backend architecture patterns used in large-scale chat systems.

The system showcases:

* realtime WebSocket communication
* scalable backend architecture
* conversation-centric database modeling
* distributed processing using queues
* stateless service design

Ping is built to resemble how messaging systems like **Slack, Discord, and WhatsApp** operate internally.

---

# ⚡ Core Capabilities

<table>
<tr>
<td>⚡</td>
<td><b>Realtime Messaging</b><br/>Low latency message delivery using WebSockets</td>
</tr>

<tr>
<td>💬</td>
<td><b>Conversation System</b><br/>1-to-1 and group chat architecture</td>
</tr>

<tr>
<td>🔐</td>
<td><b>Secure Authentication</b><br/>JWT authentication with encrypted passwords</td>
</tr>

<tr>
<td>📩</td>
<td><b>Persistent Messaging</b><br/>PostgreSQL backed message storage</td>
</tr>

<tr>
<td>🔄</td>
<td><b>Cursor Pagination</b><br/>Efficient message history retrieval</td>
</tr>

<tr>
<td>⌨️</td>
<td><b>Typing Indicators</b><br/>Ephemeral realtime events</td>
</tr>

<tr>
<td>🕵️</td>
<td><b>Stealth Mode</b><br/>Temporary Redis-based messages</td>
</tr>

<tr>
<td>🧵</td>
<td><b>Async Jobs</b><br/>Background processing via BullMQ</td>
</tr>
</table>

---

# 🧠 System Architecture

<p align="center">

```
Next.js Frontend
        │
        ▼
Express API + Socket.IO
        │
        ▼
PostgreSQL (Durable Storage)
        │
        ├── Redis (Realtime / Ephemeral Layer)
        │
        ▼
BullMQ Workers (Background Jobs)
```

</p>

<p align="center">
<b>Design Principle</b><br/>
Database owns state • WebSockets deliver events • Workers process heavy tasks
</p>

---

# 🔑 Feature Breakdown

## 🔐 Authentication

Secure login system with:

* JWT authentication
* bcrypt password hashing
* Zod schema validation
* middleware-based authorization

---

## 💬 Conversations

Conversation-centric model:

```
User
  │
  ▼
ConversationMember
  │
  ▼
Conversation
```

Benefits:

* simple authorization
* clean schema design
* natural support for group chats

---

## 📩 Messaging

Messages are stored using **PostgreSQL + Prisma ORM**.

Features:

* durable storage
* indexed queries
* cursor-based pagination
* conversation-scoped retrieval

---

## ⚡ Realtime Communication

Realtime delivery powered by **Socket.IO**.

```
Client
   │
   ▼
WebSocket Connection
   │
   ▼
Socket.IO Rooms (conversationId)
   │
   ▼
Broadcast Events
```

This ensures messages reach all conversation members instantly.

---

## ⌨️ Typing Indicators

Typing events are **ephemeral realtime signals**:

```
typing_start
typing_stop
```

They are **not stored in the database**, reducing overhead and latency.

---

## 🕵️ Stealth Mode (Ephemeral Messages)

Temporary messages stored in **Redis**.

Features:

* automatic expiration
* zero database writes
* ideal for temporary conversations

---

## 🧵 Background Processing

Heavy operations are processed by **BullMQ workers**.

Example tasks:

* conversation summarization
* AI message processing
* scheduled background jobs

---

# 🗄️ Data Model

Core entities:

```
User
UserProfile
Conversation
ConversationMember
Message
GroupSummary
```

Design principle:

```
Single conversation abstraction
→ simpler queries
→ easier permissions
→ better scalability
```

---

# 📈 Scalability Strategy

Ping is designed to scale horizontally.

Key techniques:

* stateless Express servers
* Redis pub/sub for websocket synchronization
* cursor pagination for message history
* background workers for heavy tasks
* shardable conversation architecture

This architecture can support **thousands of concurrent WebSocket connections**.

---

# 🧰 Tech Stack

### Backend

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL

### Realtime Layer

* Socket.IO
* Redis
* BullMQ

### Frontend

* Next.js
* React
* TailwindCSS

### Security

* JWT
* bcrypt
* Zod validation

### Infrastructure

* Docker containerization
* environment-based configuration
* scalable stateless services

---

# 📂 Project Structure

```
Ping
│
├ Backend
│   ├ controllers
│   ├ services
│   ├ routes
│   ├ middleware
│   ├ ws
│   │   ├ ws.server.ts
│   │   └ chat.ws.ts
│   └ prisma
│
├ frontend
│   ├ app
│   ├ components
│   ├ lib
│   └ sockets
│
└ docker
```

---

# 🚀 Local Development

Clone repository

```
git clone <repo>
cd Ping
```

### Start Backend

```
cd Backend
npm install
npm run dev
```

### Start Frontend

```
cd frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:3001
```

Backend:

```
http://localhost:3000
```

---

# 🔧 Environment Variables

Backend `.env`

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
```

---

# 🐳 Docker Deployment (Planned)

Ping will support containerized deployment:

```
Docker
 │
 ├ Backend Container
 ├ Frontend Container
 ├ PostgreSQL Container
 └ Redis Container
```

Benefits:

* reproducible environments
* easy deployment
* scalable infrastructure

---

# 🔮 Future Improvements

* online presence system
* message read receipts
* push notifications
* distributed websocket scaling
* message search indexing
* rate limiting
* end-to-end encryption

---

# 💡 Summary

Ping demonstrates how to build a **modern scalable messaging platform** using:

* realtime WebSockets
* durable database storage
* stateless backend services
* distributed background workers

The project focuses on **system design, scalability, and backend engineering principles** used in real-world messaging systems.

---

<p align="center">
⭐ If you like the project, consider starring the repository!
</p>

</p>
