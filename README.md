# PayU — Asynchronous Payments System (Backend + UI)

PayU is a hobby fintech-style payments system built to demonstrate how **real-world payment flows work behind the scenes**, not just CRUD balance updates.

Unlike synchronous APIs, PayU processes payments **asynchronously** using a queue-based architecture with background workers, ensuring correctness, idempotency, and system reliability.

This project focuses on **system design, race-condition handling, and deployment-ready patterns**, rather than surface-level features.

---

## What This Project Does

- Users can send money to other users
- Transactions are **not processed instantly**
- Each payment follows a lifecycle:
  
  **PENDING → SUCCESS / FAILED**

- Balance updates happen **outside the HTTP request**
- UI reflects real-time transaction state
- Duplicate or accidental double payments are prevented

---

## Core Concepts Implemented

- Asynchronous job processing
- Queue-backed transaction execution
- Idempotent payment handling
- Separation of concerns:
  - API = intent
  - Worker = execution
  - Ledger = internal truth
  - Transfer = external truth
- UI safety against double submissions
- Polling-based status tracking

---

## Architecture (High Level)

Client  
→ Express API (creates PENDING transfer)  
→ Redis Queue (BullMQ)  
→ Background Worker  
→ MongoDB Transaction  
→ Ledger + Balance update  
→ Transfer finalized  

The HTTP layer **never** directly mutates balances.

---

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Queue**: Redis + BullMQ
- **Auth**: JWT
- **Deployment**:
  - Backend: Render
  - Frontend: Vercel

---

## Transaction Safety Guarantees

- UI button locks immediately on submit
- Backend blocks multiple `PENDING` transfers per user
- Worker is idempotent (safe re-runs)
- MongoDB transactions ensure atomic balance updates
- Failed jobs never partially deduct funds

This prevents:
- Double-click double payments
- Retry-based duplication
- Worker crashes causing corruption

---

## Current Status

- Backend fully deployed and stable
- Frontend deployed with real-time polling
- Queue + worker running inline with backend (cost-efficient)
- Redis hosted externally
- MongoDB Atlas as persistent storage
- End-to-end payment flow working

---

## Known Limitations (Intentional)

- Render free tier may cold-start on first request
- Polling used instead of WebSockets (by design)
- UI optimized for clarity over animations
- No real money integrations (simulation only)

---

## Planned Improvements

- Email-based OTP verification
- Transaction PIN for sensitive actions
- WebSocket-based live status updates
- Better transaction history filters
- Admin/debug dashboard
- Rate limiting and abuse protection

---

## Why This Project Exists

This is **not** a demo CRUD app.

It is built to:
- Understand async systems
- Learn real payment architecture
- Handle race conditions correctly
- Practice production-grade thinking
- Serve as a strong backend portfolio project

---

## Disclaimer

This project simulates payment behavior for learning purposes only.  
No real financial transactions are performed.

---

## Author

Built as a systems-first backend project with a focus on correctness, safety, and scalability.
