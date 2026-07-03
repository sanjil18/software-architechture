package com.police.trafficfine.repository;

import com.police.trafficfine.model.FineStatus;
import com.police.trafficfine.model.TrafficFine;
import com.police.trafficfine.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TrafficFineRepository extends MongoRepository<TrafficFine, String> {

    Optional<TrafficFine> findByReferenceNumberAndCategoryId(String referenceNumber, String categoryId);

    Page<TrafficFine> findByOfficer(User officer, Pageable pageable);
    Page<TrafficFine> findByOfficerAndStatus(User officer, FineStatus status, Pageable pageable);

    Page<TrafficFine> findAllBy(Pageable pageable);

    long countByStatus(FineStatus status);
}
