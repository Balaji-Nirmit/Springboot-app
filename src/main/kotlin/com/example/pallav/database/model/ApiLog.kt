package com.collector.platform.logs.model

import com.monitoring.client.monitoring.ApiLogDto // Re-use the DTO fields
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * [cite_start]Stores raw API logs in the Logs Database. [cite: 48]
 */
@Document("api_logs")
@CompoundIndex(def = "{'serviceName': 1, 'endpoint': 1, 'timestamp': -1}")
data class ApiLog(
    @Id val id: String? = null,
    val serviceName: String,
    val endpoint: String,
    val method: String,
    val statusCode: Int,
    val latencyMs: Long,
    val requestSize: Long,
    val responseSize: Long,
    @Indexed val timestamp: Instant = Instant.now(),
    [cite_start]val rateLimitHit: Boolean = false // [cite: 49]
) {
    companion object {
        fun fromDto(dto: ApiLogDto) = ApiLog(
            serviceName = dto.serviceName,
            endpoint = dto.endpoint,
            method = dto.method,
            statusCode = dto.statusCode,
            latencyMs = dto.latencyMs,
            requestSize = dto.requestSize,
            responseSize = dto.responseSize,
            timestamp = dto.timestamp,
            rateLimitHit = dto.rateLimitHit
        )
    }
}