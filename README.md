# 📊 API Monitoring & Observability Platform (Simplified Monolithic)

This project implements the core tracking and logging components of the API Monitoring Platform using Spring Boot (Kotlin). [cite_start]As per the latest instructions, the architecture has been **consolidated into a single application** and utilizes a **single MongoDB instance**[cite: 4, 6].

---

## 1. Architecture

### [cite_start]System Overview [cite: 123]

The platform's backend is implemented as a single, **monolithic Spring Boot application**. The logic for the API Tracking Client, the Rate Limiter, and the Collector Service are all combined within this single service.

| Component | Function | Status |
| :--- | :--- | :--- |
| **Backend** | Spring Boot (Kotlin) | [cite_start]Implemented [cite: 4] |
| **Interceptor & Client** | Logic integrated into the Monolith | [cite_start]Implemented [cite: 106] |
| **Collector Service** | Ingestion logic integrated into the Monolith | Implemented |
| **Database** | Single MongoDB Instance | [cite_start]Implemented (Simplified) [cite: 6] |
| **Authentication** | JWT | [cite_start]Implemented [cite: 7, 110] |

### Core Implemented Components

* [cite_start]**API Tracking Interceptor:** A Spring `HandlerInterceptor` tracks metrics including endpoint, method, status code, latency, and request/response size[cite: 19, 20, 21, 22, 23, 24, 25, 26, 27].
* [cite_start]**Rate Limiter:** A per-service rate limiter is implemented within the tracking layer[cite: 29, 107].
* **Log Ingestion:** The interceptor directly saves the captured metrics to the single MongoDB instance.

---

## [cite_start]2. Decisions Taken [cite: 125]

The following design decisions were made to consolidate the project structure, resulting in deviations from the original assignment's microservices requirements.

| Original Assignment Requirement | Decision Taken | Rationale for Deviation |
| :--- | :--- | :--- |
| [cite_start]**Modular Architecture** (Separate API Tracking Client & Central Collector Service) [cite: 12, 13] | **Monolithic Consolidation** | Simplifies setup, deployment, and configuration by unifying all core logic (tracking, rate limiting, and log collection) into one application. |
| [cite_start]**Dual MongoDB Connections** (Logs DB & Metadata DB) [cite: 44] | **Single MongoDB Instance** | Simplifies the data layer by only requiring default Spring Data MongoDB configuration and avoiding complex dual-transaction setup. |
| [cite_start]**Concurrency Safety** (Optimistic Locking) [cite: 64] | **Omitted** | Since **Alerting** and **Issue Management** were not fully implemented in this consolidated structure, the explicit concurrency mechanism was removed. |

---

## [cite_start]3. How Rate Limiter Works [cite: 127]

The rate limiter is implemented within the `ApiTrackingInterceptor` using a custom, fixed-window counter (`PerServiceRateLimiter.kt`).

1.  [cite_start]**Configuration:** The limit (e.g., 100 requests/second) and the service identifier are read from `application.yml`[cite: 31, 35, 37, 38, 39, 40].
2.  **Mechanism:** The `PerServiceRateLimiter` uses a concurrent map to track the request count within the current time window.
3.  **Flow:**
    * [cite_start]During `preHandle`, the `ApiTrackingInterceptor` checks the limit[cite: 30].
    * [cite_start]If the limit is exceeded, a **`rateLimitHit` flag is set to `true`** on the request context[cite: 34].
    * [cite_start]**Crucial Logic:** The request is always allowed to continue normally to the controller, regardless of the rate limit status[cite: 33].
    * In `afterCompletion`, the final `ApiLog` entry is created and saved, recording the `rateLimitHit` status.

---

## [cite_start]4. How Dual MongoDB Setup Works [cite: 126]

**The Dual MongoDB setup is NOT implemented in this repository.**

[cite_start]The original requirement mandated connecting to two separate MongoDB instances: a **Logs Database** for high write-throughput [cite: 46, 47, 48, 49] [cite_start]and a **Metadata Database** for consistency-critical data like user accounts and incidents[cite: 50, 51, 52, 54, 55, 56].

**Current Implementation:**
* The application uses **one single MongoDB instance** with the default Spring configuration.
* All data (API Logs, Users, Notes) is stored in this single instance.

---

## [cite_start]5. DB Schemas [cite: 124]

This section details the primary MongoDB collections used in the application's single instance.

### `api_logs` (Core Log Data)

[cite_start]This collection stores the complete telemetry for every API request[cite: 48].

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `ObjectId` | Primary key. |
| `serviceName` | `String` | [cite_start]The service originating the request[cite: 27]. |
| `endpoint` | `String` | [cite_start]The URI path[cite: 20]. |
| `method` | `String` | [cite_start]HTTP Method[cite: 21]. |
| `statusCode` | `Int` | [cite_start]HTTP Response status code[cite: 24]. |
| `latencyMs` | `Long` | [cite_start]Request processing time in milliseconds[cite: 26]. |
| `requestSize` | `Long` | [cite_start]Size of the request body in bytes[cite: 22]. |
| `responseSize` | `Long` | [cite_start]Size of the response body in bytes[cite: 23]. |
| `timestamp` | `Instant` | [cite_start]Time of the log entry[cite: 25]. |
| `rateLimitHit` | `Boolean` | [cite_start]Flag indicating the rate limit was exceeded[cite: 34, 49]. |

### `users` (Authentication Metadata)

[cite_start]This collection stores user accounts required for JWT authentication[cite: 52].

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `ObjectId` | Primary key. |
| `username` | `String` | Unique login username. |
| `email` | `String` | User email address. |
| `passwordHash`| `String` | BCrypt hash of the user's password. |
| `role` | `String` | User role. |

***

### Other Collections (Based on provided files)

* `note`
* `refresh_token`