package com.monitoring.client.ratelimiter

import com.monitoring.client.config.MonitoringProperties
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

/**
 * [cite_start]Custom fixed-window rate limiter implementation based on service configuration. [cite: 30]
 */
@Component
class PerServiceRateLimiter(
    private val properties: MonitoringProperties
) {
    // Key: Timestamp_Window_Start_Seconds | Value: Request Count
    private val serviceRequestCounts = ConcurrentHashMap<Long, AtomicInteger>()

    /**
     * Checks if the service has exceeded the configured rate limit for the current window.
     * The request count is incremented regardless of the outcome.
     */
    fun isLimitExceeded(): Boolean {
        // Calculate the start of the current window in seconds
        val windowDurationMs = properties.durationSeconds * 1000
        val currentWindowStart = System.currentTimeMillis() / windowDurationMs
        
        // Cleanup old windows (simplistic cleanup for demonstration)
        serviceRequestCounts.keys.removeIf { it < currentWindowStart }

        // Get or create the counter for the current window
        val count = serviceRequestCounts.computeIfAbsent(currentWindowStart) { AtomicInteger(0) }
        
        val currentCount = count.incrementAndGet()
        
        return currentCount > properties.limit
    }
}