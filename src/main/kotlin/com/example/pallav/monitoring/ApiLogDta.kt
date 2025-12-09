package com.monitoring.client.monitoring

import java.time.Instant

/**
 * [cite_start]Data Transfer Object for API logs sent to the Central Collector Service. [cite: 28]
 */
data class ApiLogDto(
    [cite_start]val serviceName: String, // [cite: 27]
    [cite_start]val endpoint: String, // [cite: 20]
    [cite_start]val method: String, // [cite: 21]
    [cite_start]val statusCode: Int, // [cite: 24]
    [cite_start]val latencyMs: Long, // [cite: 26]
    [cite_start]val requestSize: Long, // [cite: 22]
    [cite_start]val responseSize: Long, // [cite: 23]
    [cite_start]val timestamp: Instant = Instant.now(), // [cite: 25]
    [cite_start]val rateLimitHit: Boolean = false // Flag indicating if the limit was exceeded [cite: 34]
)