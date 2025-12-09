# 📊 API Monitoring & Observability Platform (Simplified Monolithic)

This document describes the design and implementation of the backend for the API Monitoring Platform. It is built using **Spring Boot (Kotlin)** and utilizes a **single MongoDB instance**.

The architecture was consolidated from a multi-service model (Client + Collector) into a single application to simplify deployment and initial development.

---

## 1. Architecture

### System Overview

The application functions as a **monolithic service**, handling both the **API tracking** (interception and rate limiting) and the **log collection/viewer API** within the same codebase.

| Component | Function | Implementation Details |
| :--- | :--- | :--- |
| **Backend** | API/Log Processing | Spring Boot (Kotlin) |
| **Tracking Layer** | Metric Capture & Rate Limiting | `ApiTrackingInterceptor.kt` |
| **Data Storage** | Logs, Users, Notes | Single MongoDB Instance |
| **Authentication** | User Security | JWT (via `SecurityConfig.kt`) |

### Core Workflow

1.  An API request hits the monolithic service.
2.  The `ApiTrackingInterceptor` intercepts the request.
3.  The request passes through the **Rate Limiter**.
4.  The request is processed by a controller.
5.  After the response is generated, the interceptor captures all metrics (latency, status, size, etc.).
6.  The complete **`ApiLog`** entity is persisted to the MongoDB.
7.  Secured endpoints expose this log data for the Next.js frontend.

---

## 2. Decisions Taken

The following choices deviate from the original assignment to simplify the project into a single, cohesive service:

* **Monolithic Consolidation:** The **API Tracking Client** and the **Central Collector Service** were merged into a single application. This simplifies deployment but sacrifices the scalability and modularity of the original microservices design.
* **Single MongoDB Instance:** The mandatory requirement for **two separate MongoDB databases** (Logs DB and Metadata DB) was waived. All data, including high-volume logs and critical metadata (Users/Notes), resides in one database.
* **Concurrency Mechanism Omitted:** Since the complex **Issue Management** and **Alerting** components (which required the separate Metadata DB and concurrency safety like Optimistic Locking) were not fully implemented in this simplified structure, the dedicated concurrency mechanism was removed.

---

## 3. How Dual MongoDB Setup Works

**NOTE:** The requirement for dual MongoDB connections is **NOT implemented** in this repository.

The original intent was:
* **Logs Database:** To handle extremely high write throughput of raw API metrics.
* **Metadata Database:** To store mission-critical data (Users, Issues, Alerts) where consistency is paramount, often requiring separate resources or replica set configurations.

In this simplified model, the application uses **only the default single MongoDB connection**. This means log ingestion and user data access all share the same database resources.

---

## 4. How Rate Limiter Works

The rate limiting mechanism is implemented at the tracking layer to enforce traffic constraints on an API-consuming service.

* **Component:** The logic resides in `PerServiceRateLimiter.kt` and is executed by `ApiTrackingInterceptor.kt`.
* **Mechanism:** It uses a **Fixed-Window Counter** to track the number of requests made by the service within a defined time window (e.g., 1 second). The limit is configured via `application.yml`.
* **Functionality:**
    1.  When a request is intercepted, the rate limiter check is performed.
    2.  If the configurable limit is exceeded, a flag (`rateLimitHit`) is set to `true`.
    3.  **Crucial Logic:** The request is always allowed to continue normally to the controller, regardless of the rate limit status.
    4.  The `ApiLog` entry records the `rateLimitHit` status, allowing the dashboard to analyze violation history.

---

## 5. DB Schemas

This application uses a single MongoDB instance with the following collections (models):

### `api_logs` (Core Log Data)
This collection stores the complete telemetry for every request captured by the interceptor.

| Field | Description |
| :--- | :--- |
| `id` | Primary key. |
| `serviceName` | The originating service name. |
| `endpoint` | The URI path. |
| `statusCode` | HTTP Response status code. |
| `latencyMs` | Request processing time in milliseconds. |
| `rateLimitHit` | Flag indicating if the rate limit was exceeded during this request. |

### `users` (Authentication Metadata)
Stores user accounts for JWT authentication (`User.kt`).

| Field | Description |
| :--- | :--- |
| `id` | Primary key. |
| `email` | User email. |
| `hashedPassword`| BCrypt hash of the user's password. |

### Other Collections
The application also includes existing collections for application-specific data:

* **`notes`**: Stores general notes data (`Note.kt`).
* **`refresh_tokens`**: Stores refresh tokens for extended sessions (`RefreshToken.kt`).