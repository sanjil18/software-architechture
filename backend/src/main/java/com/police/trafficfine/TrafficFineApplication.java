package com.police.trafficfine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Sri Lanka Traffic Fine System — Spring Boot backend.
 *
 * Migrated from the original Node.js/Express + Mongoose backend.
 * MongoDB is retained as the data store, so the domain model and REST
 * contract (paths, JSON shapes, status codes) match the original API,
 * which means the existing React web frontend and React Native mobile
 * app keep working unchanged.
 */
@SpringBootApplication
public class TrafficFineApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrafficFineApplication.class, args);
    }
}
