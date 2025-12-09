package com.monitoring.client.config

import org.springframework.boot.context.properties.ConfigurationProperties

/**
 * [cite_start]Configuration for the per-service rate limiter. [cite: 35]
 */
@ConfigurationProperties(prefix = "monitoring.ratelimit")
data class MonitoringProperties(
    val service: String = "default-service",
    [cite_start]val limit: Int = 100, // Default 100 requests/second [cite: 31]
    val durationSeconds: Long = 1
)