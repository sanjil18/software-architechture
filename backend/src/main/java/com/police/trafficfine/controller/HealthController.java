package com.police.trafficfine.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Equivalent of the GET /health route in the original server.js.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> portals = new LinkedHashMap<>();
        portals.put("payment", "http://localhost:5000/");
        portals.put("admin", "http://localhost:5000/admin");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Sri Lanka Traffic Fine System API is running");
        body.put("portals", portals);
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}
