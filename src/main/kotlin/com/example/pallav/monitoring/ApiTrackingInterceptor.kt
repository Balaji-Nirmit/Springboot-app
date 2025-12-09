package com.monitoring.client.monitoring

import com.monitoring.client.config.MonitoringProperties
import com.monitoring.client.ratelimiter.PerServiceRateLimiter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.util.ContentCachingRequestWrapper
import org.springframework.web.util.ContentCachingResponseWrapper
import org.springframework.web.reactive.client.WebClient

/**
 * [cite_start]Core component: Intercepts requests, applies rate limiting, and collects metrics. [cite: 106]
 */
@Component
class ApiTrackingInterceptor(
    private val rateLimiter: PerServiceRateLimiter,
    private val monitoringProperties: MonitoringProperties,
    private val collectorService: CollectorService
) : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(javaClass)
    private val START_TIME_ATTRIBUTE = "startTime"
    private val RATE_LIMIT_HIT_ATTRIBUTE = "rateLimitHit"

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        // 1. Wrap request/response for content caching (to read size later)
        if (request !is ContentCachingRequestWrapper) {
            // In a real Spring Boot app, you'd register a filter to wrap these globally
            // For simplicity in this library, we assume the wrapper is present or handle it gracefully.
        }

        // 2. Capture Start Time
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis())
        
        [cite_start]// 3. Rate Limit Check (Non-blocking) [cite: 107]
        val rateLimitHit = rateLimiter.isLimitExceeded()
        request.setAttribute(RATE_LIMIT_HIT_ATTRIBUTE, rateLimitHit)
        
        if (rateLimitHit) {
            [cite_start]// Requirement: Request must continue normally even if rate-limited. [cite: 33]
            log.warn("Rate limit hit for service: ${monitoringProperties.service}")
        }
        
        [cite_start]return true // Always allow the request to proceed [cite: 33]
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        val startTime = request.getAttribute(START_TIME_ATTRIBUTE) as? Long ?: return
        [cite_start]val latencyMs = System.currentTimeMillis() - startTime // [cite: 26]
        
        [cite_start]// Use Caching wrappers to safely read content size [cite: 22, 23]
        val requestWrapper = request as? ContentCachingRequestWrapper
        val responseWrapper = response as? ContentCachingResponseWrapper

        val requestSize = requestWrapper?.contentAsByteArray?.size?.toLong() ?: 0L
        // NOTE: In a real scenario, you must call responseWrapper.copyBodyToResponse()
        val responseSize = responseWrapper?.contentAsByteArray?.size?.toLong() ?: 0L
        
        val logDto = ApiLogDto(
            [cite_start]serviceName = monitoringProperties.service, // [cite: 27]
            [cite_start]endpoint = request.requestURI, // [cite: 20]
            [cite_start]method = request.method, // [cite: 21]
            [cite_start]statusCode = response.status, // [cite: 24]
            latencyMs = latencyMs,
            requestSize = requestSize,
            responseSize = responseSize,
            [cite_start]rateLimitHit = request.getAttribute(RATE_LIMIT_HIT_ATTRIBUTE) as Boolean // [cite: 34]
        )

        [cite_start]// 4. Send log to collector (asynchronously and non-blocking) [cite: 28]
        collectorService.sendLog(logDto)
    }
}

/**
 * Service to send logs to the central collector using WebClient.
 */
@Component
class CollectorService(
    private val webClient: WebClient
) {
    private val log = LoggerFactory.getLogger(javaClass)
    // NOTE: In a real environment, this URL would be configurable
    private val COLLECTOR_INGEST_URL = "http://localhost:8080/collector/ingest" 

    fun sendLog(logDto: ApiLogDto) {
        webClient.post()
            .uri(COLLECTOR_INGEST_URL)
            .bodyValue(logDto)
            .retrieve()
            .toBodilessEntity()
            .doOnError { e -> log.error("Failed to send log to collector: ${e.message}") }
            .subscribe() // Non-blocking send
    }
}

/**
 * Configuration to register the interceptor and WebClient.
 */
@Configuration
class WebConfig(
    private val apiTrackingInterceptor: ApiTrackingInterceptor
) : WebMvcConfigurer {
    
    [cite_start]// Register the interceptor [cite: 106]
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(apiTrackingInterceptor).addPathPatterns("/**")
    }

    // Bean for non-blocking communication
    @Bean
    fun webClient(): WebClient {
        return WebClient.builder().build()
    }
}