package com.example.pallav.database.repository

import com.example.pallav.database.model.ApiLog
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ApiLogRepository : MongoRepository<ApiLog, String> {

    /**
     * [cite_start]Finds logs for a specific service name, useful for the API Request Explorer filters[cite: 76].
     */
    fun findByServiceName(serviceName: String, sort: Sort): List<ApiLog>

    /**
     * [cite_start]Finds logs by endpoint, useful for drilling down into specific APIs[cite: 77].
     */
    fun findByEndpoint(endpoint: String, sort: Sort): List<ApiLog>

    /**
     * [cite_start]Finds logs with a status code within a specified range, e.g., 500-599 for broken APIs[cite: 80, 82].
     */
    fun findByStatusCodeBetween(start: Int, end: Int, sort: Sort): List<ApiLog>

    /**
     * [cite_start]Finds logs that exceed a certain latency threshold (e.g., 500ms) for "Slow APIs" filter[cite: 81, 97].
     */
    fun findByLatencyMsGreaterThan(latencyMs: Long, sort: Sort): List<ApiLog>

    /**
     * [cite_start]Finds logs where the rate limit was hit[cite: 83, 99].
     */
    fun findByRateLimitHit(rateLimitHit: Boolean, sort: Sort): List<ApiLog>
}