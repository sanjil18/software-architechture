package com.trafficfine.config;

import com.trafficfine.entity.FineCategory;
import com.trafficfine.entity.Officer;
import com.trafficfine.entity.User;
import com.trafficfine.repository.FineCategoryRepository;
import com.trafficfine.repository.OfficerRepository;
import com.trafficfine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OfficerRepository officerRepository;
    private final FineCategoryRepository fineCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedCategories();
        seedOfficersAndUsers();
        log.info("=== Data initialization complete ===");
        log.info("Admin login  → username: admin     | password: admin123");
        log.info("Officer login→ username: officer1  | password: officer123");
    }

    private void seedCategories() {
        if (fineCategoryRepository.count() > 0) return;

        List<FineCategory> categories = List.of(
            FineCategory.builder().categoryCode("CAT001").name("Speeding").description("Exceeding the speed limit").defaultAmount(new BigDecimal("2500.00")).build(),
            FineCategory.builder().categoryCode("CAT002").name("Red Light Violation").description("Passing a red traffic signal").defaultAmount(new BigDecimal("3000.00")).build(),
            FineCategory.builder().categoryCode("CAT003").name("No Helmet").description("Motorcycle rider without helmet").defaultAmount(new BigDecimal("1500.00")).build(),
            FineCategory.builder().categoryCode("CAT004").name("No Seat Belt").description("Driver without seat belt").defaultAmount(new BigDecimal("2000.00")).build(),
            FineCategory.builder().categoryCode("CAT005").name("Drunk Driving").description("Driving under influence of alcohol").defaultAmount(new BigDecimal("25000.00")).build(),
            FineCategory.builder().categoryCode("CAT006").name("No Licence").description("Driving without a valid licence").defaultAmount(new BigDecimal("5000.00")).build(),
            FineCategory.builder().categoryCode("CAT007").name("Illegal Parking").description("Parking in a no-parking zone").defaultAmount(new BigDecimal("1000.00")).build(),
            FineCategory.builder().categoryCode("CAT008").name("Mobile Phone Use").description("Using mobile phone while driving").defaultAmount(new BigDecimal("2000.00")).build(),
            FineCategory.builder().categoryCode("CAT009").name("Overloading").description("Vehicle overloaded beyond capacity").defaultAmount(new BigDecimal("3500.00")).build(),
            FineCategory.builder().categoryCode("CAT010").name("No Insurance").description("Driving without valid insurance").defaultAmount(new BigDecimal("4000.00")).build()
        );
        fineCategoryRepository.saveAll(categories);
        log.info("Seeded {} fine categories", categories.size());
    }

    private void seedOfficersAndUsers() {
        if (userRepository.count() > 0) return;

        // Admin user
        userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .enabled(true)
                .build());

        // Officer 1
        Officer officer1 = officerRepository.save(Officer.builder()
                .badgeNumber("OFF001")
                .name("Sgt. Perera")
                .phoneNumber("+94771234567")
                .district("Colombo")
                .station("Kollupitiya")
                .build());

        userRepository.save(User.builder()
                .username("officer1")
                .password(passwordEncoder.encode("officer123"))
                .role(User.Role.OFFICER)
                .officer(officer1)
                .enabled(true)
                .build());

        // Officer 2
        Officer officer2 = officerRepository.save(Officer.builder()
                .badgeNumber("OFF002")
                .name("Sgt. Silva")
                .phoneNumber("+94777654321")
                .district("Kandy")
                .station("Kandy Central")
                .build());

        userRepository.save(User.builder()
                .username("officer2")
                .password(passwordEncoder.encode("officer123"))
                .role(User.Role.OFFICER)
                .officer(officer2)
                .enabled(true)
                .build());

        log.info("Seeded admin + 2 officer accounts");
    }
}
