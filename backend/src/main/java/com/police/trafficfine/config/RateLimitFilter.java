package com.police.trafficfine.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory per-IP rate limiter for /api/**, equivalent of the
 * express-rate-limit middleware in the original server.js
 * (windowMs: 15 minutes, max: 100 requests).
 *
 * For a multi-instance deployment, swap this for a shared store
 * (e.g. Redis/Bucket4j) — this in-memory version matches the original
 * single-instance behaviour.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final int maxRequests;
    private final long windowMs;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(@Value("${app.rate-limit.max-requests:100}") int maxRequests,
                            @Value("${app.rate-limit.window-minutes:15}") int windowMinutes) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMinutes * 60_000L;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api")) {
            chain.doFilter(request, response);
            return;
        }

        String key = request.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket());

        long now = System.currentTimeMillis();
        synchronized (bucket) {
            if (now - bucket.windowStart > windowMs) {
                bucket.windowStart = now;
                bucket.count.set(0);
            }
            if (bucket.count.incrementAndGet() > maxRequests) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("success", false);
                body.put("message", "Too many requests. Please try again later.");
                response.getWriter().write(objectMapper.writeValueAsString(body));
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private static class Bucket {
        volatile long windowStart = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
    }
}
