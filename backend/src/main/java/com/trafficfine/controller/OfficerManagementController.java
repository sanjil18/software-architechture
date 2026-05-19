package com.trafficfine.controller;

import com.trafficfine.entity.Officer;
import com.trafficfine.entity.User;
import com.trafficfine.repository.OfficerRepository;
import com.trafficfine.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/officers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class OfficerManagementController {

    private final OfficerRepository officerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Officer>> getAllOfficers() {
        return ResponseEntity.ok(officerRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Officer> createOfficer(@RequestBody CreateOfficerRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        Officer officer = officerRepository.save(Officer.builder()
                .badgeNumber(request.getBadgeNumber())
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .district(request.getDistrict())
                .station(request.getStation())
                .build());

        userRepository.save(User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.OFFICER)
                .officer(officer)
                .enabled(true)
                .build());

        return ResponseEntity.ok(officer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Officer> updateOfficer(@PathVariable Long id, @RequestBody Officer updated) {
        Officer officer = officerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        officer.setName(updated.getName());
        officer.setPhoneNumber(updated.getPhoneNumber());
        officer.setDistrict(updated.getDistrict());
        officer.setStation(updated.getStation());
        return ResponseEntity.ok(officerRepository.save(officer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOfficer(@PathVariable Long id) {
        officerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class CreateOfficerRequest {
        private String badgeNumber;
        private String name;
        private String phoneNumber;
        private String district;
        private String station;
        private String username;
        private String password;
    }
}
