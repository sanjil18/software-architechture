package com.trafficfine.controller;

import com.trafficfine.dto.FineDto;
import com.trafficfine.entity.FineCategory;
import com.trafficfine.entity.Officer;
import com.trafficfine.entity.TrafficFine;
import com.trafficfine.entity.User;
import com.trafficfine.repository.FineCategoryRepository;
import com.trafficfine.repository.OfficerRepository;
import com.trafficfine.repository.TrafficFineRepository;
import com.trafficfine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('OFFICER') or hasRole('ADMIN')")
public class OfficerController {

    private final TrafficFineRepository fineRepository;
    private final UserRepository userRepository;
    private final FineCategoryRepository categoryRepository;
    private final OfficerRepository officerRepository;

    /** Get all fines issued by the currently logged-in officer */
    @GetMapping("/my-fines")
    public ResponseEntity<List<FineDto.FineResponse>> getMyFines() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        if (user.getOfficer() == null) return ResponseEntity.ok(List.of());
        List<FineDto.FineResponse> fines = fineRepository.findAll().stream()
                .filter(f -> f.getOfficer() != null && f.getOfficer().getId().equals(user.getOfficer().getId()))
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(fines);
    }

    private FineDto.FineResponse toDto(TrafficFine f) {
        return FineDto.FineResponse.builder()
                .id(f.getId())
                .referenceNumber(f.getReferenceNumber())
                .categoryCode(f.getCategory().getCategoryCode())
                .categoryName(f.getCategory().getName())
                .vehicleNumber(f.getVehicleNumber())
                .driverName(f.getDriverName())
                .amount(f.getAmount())
                .district(f.getDistrict())
                .location(f.getLocation())
                .officerName(f.getOfficer() != null ? f.getOfficer().getName() : "N/A")
                .status(f.getStatus().name())
                .issuedAt(f.getIssuedAt())
                .build();
    }

    /** Get all available fine categories (for dropdown on issue-fine screen) */
    @GetMapping("/categories")
    public ResponseEntity<List<FineCategory>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /** Get officer profile */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Officer officer = user.getOfficer();
        if (officer == null) return ResponseEntity.ok(Map.of("username", username, "role", user.getRole()));
        return ResponseEntity.ok(Map.of(
                "username", username,
                "role", user.getRole(),
                "badgeNumber", officer.getBadgeNumber(),
                "name", officer.getName(),
                "district", officer.getDistrict(),
                "station", officer.getStation(),
                "phoneNumber", officer.getPhoneNumber()
        ));
    }
}
