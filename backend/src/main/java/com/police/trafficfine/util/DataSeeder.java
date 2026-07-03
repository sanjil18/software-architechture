package com.police.trafficfine.util;

import com.police.trafficfine.model.FineCategory;
import com.police.trafficfine.model.Role;
import com.police.trafficfine.model.User;
import com.police.trafficfine.repository.FineCategoryRepository;
import com.police.trafficfine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Equivalent of backend/src/utils/seed.js. Runs automatically on startup
 * only when `app.seed.enabled=true` (env var SEED_ON_STARTUP=true), and
 * only if the categories/users collections are empty — so it's safe to
 * leave enabled across restarts.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FineCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;

        if (categoryRepository.count() == 0) {
            List<FineCategory> categories = List.of(
                    cat("TF001", "Speeding", "Exceeding the speed limit", 2500, 5),
                    cat("TF002", "Signal Violation", "Jumping red signal or traffic light", 2000, 4),
                    cat("TF003", "No Helmet", "Riding motorcycle without helmet", 1500, 3),
                    cat("TF004", "No Seat Belt", "Driving without seat belt", 1500, 3),
                    cat("TF005", "Drunk Driving", "Driving under influence of alcohol", 10000, 10),
                    cat("TF006", "Overloading", "Vehicle overloaded beyond capacity", 3000, 4),
                    cat("TF007", "No License", "Driving without a valid license", 5000, 8),
                    cat("TF008", "Wrong Parking", "Parking in unauthorized areas", 1000, 2),
                    cat("TF009", "Mobile Phone Use", "Using mobile phone while driving", 2000, 4),
                    cat("TF010", "Reckless Driving", "Driving in a reckless or dangerous manner", 5000, 7)
            );
            categoryRepository.saveAll(categories);
            log.info("✅ Inserted {} fine categories", categories.size());
        }

        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .name("Admin User").email("admin@police.lk")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN).phone("+94711234567").district("Colombo").active(true).build());

            userRepository.save(User.builder()
                    .name("Officer Kamal Perera").email("kamal.perera@police.lk")
                    .password(passwordEncoder.encode("officer123"))
                    .role(Role.OFFICER).badgeNumber("SLP-001").phone("+94712345678")
                    .district("Colombo").active(true).build());

            userRepository.save(User.builder()
                    .name("Officer Saman Silva").email("saman.silva@police.lk")
                    .password(passwordEncoder.encode("officer123"))
                    .role(Role.OFFICER).badgeNumber("SLP-002").phone("+94713456789")
                    .district("Gampaha").active(true).build());

            log.info("✅ Inserted 3 users");
            log.info("📋 Login Credentials:");
            log.info("Admin    -> admin@police.lk / admin123");
            log.info("Officer1 -> kamal.perera@police.lk / officer123");
            log.info("Officer2 -> saman.silva@police.lk / officer123");
        }
    }

    private FineCategory cat(String id, String name, String desc, double amount, int points) {
        return FineCategory.builder()
                .categoryId(id).name(name).description(desc)
                .amount(amount).points(points).isActive(true)
                .build();
    }
}
