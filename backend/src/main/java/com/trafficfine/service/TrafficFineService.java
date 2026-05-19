package com.trafficfine.service;

import com.trafficfine.dto.FineDto;
import com.trafficfine.entity.FineCategory;
import com.trafficfine.entity.Officer;
import com.trafficfine.entity.TrafficFine;
import com.trafficfine.entity.User;
import com.trafficfine.repository.FineCategoryRepository;
import com.trafficfine.repository.TrafficFineRepository;
import com.trafficfine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrafficFineService {

    private final TrafficFineRepository fineRepository;
    private final FineCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public FineDto.FineResponse createFine(FineDto.CreateFineRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User officer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        FineCategory category = categoryRepository.findByCategoryCode(request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryCode()));

        String refNumber = "TF-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        TrafficFine fine = TrafficFine.builder()
                .referenceNumber(refNumber)
                .category(category)
                .vehicleNumber(request.getVehicleNumber())
                .driverName(request.getDriverName())
                .driverNic(request.getDriverNic())
                .amount(category.getDefaultAmount())
                .district(request.getDistrict())
                .location(request.getLocation())
                .officer(officer.getOfficer())
                .status(TrafficFine.FineStatus.PENDING)
                .issuedAt(LocalDateTime.now())
                .build();

        fine = fineRepository.save(fine);
        return mapToResponse(fine);
    }

    public FineDto.FineResponse lookupFine(String referenceNumber, String categoryCode) {
        TrafficFine fine = fineRepository
                .findByReferenceNumberAndCategory_CategoryCode(referenceNumber, categoryCode)
                .orElseThrow(() -> new RuntimeException("Fine not found with given reference and category"));

        if (fine.getStatus() == TrafficFine.FineStatus.PAID) {
            throw new RuntimeException("This fine has already been paid");
        }
        return mapToResponse(fine);
    }

    public List<FineDto.FineResponse> getAllFines() {
        return fineRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    private FineDto.FineResponse mapToResponse(TrafficFine fine) {
        return FineDto.FineResponse.builder()
                .id(fine.getId())
                .referenceNumber(fine.getReferenceNumber())
                .categoryCode(fine.getCategory().getCategoryCode())
                .categoryName(fine.getCategory().getName())
                .vehicleNumber(fine.getVehicleNumber())
                .driverName(fine.getDriverName())
                .amount(fine.getAmount())
                .district(fine.getDistrict())
                .location(fine.getLocation())
                .officerName(fine.getOfficer() != null ? fine.getOfficer().getName() : "N/A")
                .status(fine.getStatus().name())
                .issuedAt(fine.getIssuedAt())
                .build();
    }
}
