# ByteURL — Distributed URL Shortener (Microservices + Docker + Redis + Gateway)

## Overview
A production-style **URL shortening system** built using **microservices**, **Docker Compose**, **Redis caching**, **MongoDB**, and an **Nginx API Gateway**, with a modern **React** dashboard.

---

## 🏗 Project Architecture

### 1. Dashboard (Frontend)  
**Tech:** React, Vite, Axios  
**Folder:** `/client`
 
The dashboard is the primary interface for interacting with ByteURL. It allows users to:
  - Register and log in
  - Create short URLs with different link types (standard, expiring, one-time)
  - View a table of all their URLs and click stats  
  The app talks only to the **API Gateway** at `http://localhost:8080`, keeping the microservices hidden behind a single entrypoint.

### 2. Database
- **Tech:** MongoDB, Redis
- **Description:**
  - MongoDB stores:
    - User accounts
    - URL metadata (long URL, short code, link type, expiry, click count)
  - Redis is used for:
    - Caching short code → long URL for ultra-fast redirects
    - Rate limiting users on the /api/shorten endpoint
  Both services run as containers via docker-compose, and are accessed by the Node.js microservices inside the same Docker network.

### 3. API Gateway (Nginx)
- **Tech:** MongoDB, Redis
- **Folder:** `/nginx`
- **Description:**
  The API Gateway is the **single entrypoint** for the backend. It exposes one public host/port and then routes internally to the correct microservice. It also injects X-Request-ID headers for correlation-ID based logging

### 4. Auth Service
- **Function:** Authentication & User Management
- **Tech:** Node.js, Express, JWT, MongoDB
- **Folder:** `services/auth`
- **Description:**
  The Auth service is responsible for:
  - Registering users
  - Logging users in
  - Issuing and validating JWT tokens
  - Protecting downstream routes via requireAuth middleware
 

### 5. Shortener Service
- **Function:** URL Shortening, Link Logic & Redirects
- **Tech:** Node.js, Express, MongoDB, Redis
- **Folder:** `services/shortener/`
- **Description:**
  The Shortener service handles all URL-related logic:
  - Creating short URLs for logged-in users
  - Supporting different link types:
    - Standard (no expiry)
    - Temporary (7 days / 30 days)
    - One-time (works once, then expires)
  - Tracking clicks and enforcing expiry rules
  - Using Redis as a cache for short code → long URL
  - Implementing per-user rate limiting for `/api/shorten`
  - Logging with correlation IDs to trace requests

### 6. Client Interaction
- **Description:**
  The interaction between the user and the system flows through the following steps:
  - **Authentiction**
    - User opens the React dashboard.
    - The dashboard calls the Gateway:
      -  `POST /auth/register` to create an account.
      -  `POST /auth/login` to obtain a JWT token.
    - The JWT token is stored on the client and attached as
      `Authorization: Bearer <token>` for future requests.
  - **Creating a Short URL:**
    - User pastes a long URL and selects a link type (standard, 7 days, 30 days, one-time). 
    - Dashboard sends `POST /api/shorten` with the long URL and mode.
    - Gateway routes this to the Shortener service.
    - Shortener:
      - Validates token via shared JWT secret.
      - Computes expiry / max-click rules.
      - Stores the entry in MongoDB.
      - Caches the mapping in Redis.
  - **Rate Limiting & Logging:**
    - Each `/api/shorten` call goes through a Redis-based rate limiter (e.g., max 20 requests/min per user).
    - Each request is tagged with a correlation ID (`X-Request-ID`) so logs from different services can be tied back to the same user action.

## Snippets

<img width="908" height="420" alt="ByteURL login page" src="https://github.com/user-attachments/assets/b38cc4e6-33d6-4ff1-ae32-89cba4d32906" />
<img width="908" height="420" alt="ByteURL dash" src="https://github.com/user-attachments/assets/961b074f-e6f1-40cb-b3c9-3e6d5d780030" />
