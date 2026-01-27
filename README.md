# Ping — Real-Time Messaging Platform

Ping is a real-time messaging platform inspired by modern chat systems, built to explore scalable conversation modeling, ephemeral messaging, and asynchronous processing.

The backend is built using **Node.js, TypeScript, Express, and Prisma ORM**, with **PostgreSQL** as the primary database. The project emphasizes backend system design, data modeling, and infrastructure decisions commonly used in production messaging systems.

---

## ✨ Core Features

### Authentication & Identity
- Email/password signup and signin
- JWT-based authentication
- Separate user profile layer (display name, avatar)

### Conversations
- One-to-one conversations
- Group conversations
- Role-based membership (admin/member)
- Unified conversation abstraction (no separate group tables)

### Messaging
- Persistent messaging backed by PostgreSQL
- Prisma ORM used for type-safe database access
- Pagination-ready message retrieval
- Authorization checks at conversation level

### Realtime Communication
- WebSocket-based realtime messaging
- Room-based message broadcasting using conversation IDs
- Database as source of truth, sockets as delivery layer

### Stealth Mode (Ephemeral Messaging)
- Messages stored only in Redis
- TTL-based automatic expiration
- No database persistence
- Inspired by disappearing message systems

### Asynchronous Processing
- Background job processing using BullMQ
- AI-powered group conversation summaries
- Non-blocking async workflows (cold paths separated from hot paths)

---

## 🧠 System Design Overview

Ping is designed around a conversation-centric model:

- Users do not message other users directly
- All communication happens inside Conversations
- Membership and roles are handled via a join table

This enables:
- Clean support for both 1–1 and group chats
- Centralized authorization logic
- Easy scalability and extensibility

---

## 🗄️ Data Model

### Core Tables
- User — authentication and identity
- UserProfile — display information
- Conversation — chat container (1–1 or group)
- ConversationMember — membership & roles
- Message — persistent messages
- GroupSummary — async AI summaries

### Storage Strategy
- PostgreSQL + Prisma ORM → durable state (users, conversations, messages)
- Redis → ephemeral state (stealth messages with TTL)
- BullMQ → async processing (AI summaries, background jobs)

This separation ensures:
- Fast hot-path execution
- Clean lifecycle management
- Scalable system behavior

---

## 🔄 Request Flow Example

### Sending a Normal Message
1. Client sends message request
2. Backend validates conversation membership
3. Message is persisted via Prisma into PostgreSQL
4. Message is emitted to connected clients via WebSocket

### Sending a Stealth Message
1. Client sends message request
2. Message is stored in Redis with TTL
3. Message is emitted via WebSocket
4. Message expires automatically without DB writes

---

## 🧰 Tech Stack

### Backend
- Node.js
- TypeScript
- Express
- **Prisma ORM**
- PostgreSQL

### Realtime & Infrastructure
- WebSockets / Socket.IO
- Redis (TTL-based ephemeral storage)
- BullMQ (background jobs)

### Security & Validation
- bcrypt (password hashing)
- JWT (authentication)
- Zod (request validation)

---

## 📦 Project Structure (Simplified)

