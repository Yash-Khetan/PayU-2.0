# PayU – Asynchronous Payments Backend

PayU is a backend-only payments system designed to simulate how real-world digital payments work behind the scenes.

Instead of processing payments synchronously like a simple CRUD app, PayU uses queues and background workers to handle transactions asynchronously — similar to production-grade fintech systems.

This project focuses on system design, reliability, and scalability.

---

## Features

- User authentication using JWT
- Asynchronous payment processing with Redis + BullMQ
- FIFO queue-based transaction handling
- Transaction lifecycle:
  pending → processing → success / failed
- Idempotent transaction execution
- Background workers separated from HTTP requests
- MongoDB Atlas for persistent storage
- Redis running via Docker

---

## Tech Stack

- Node.js
- Express
- MongoDB Atlas
- Redis
- BullMQ
- Docker
- JWT Authentication

---

## Architecture Overview

Client  
↓  
Express API  
↓  
Transaction (status: pending)  
↓  
Redis Queue (BullMQ)  
↓  
Worker  
↓  
Balance update + transaction finalization  

---
