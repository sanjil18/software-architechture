package com.police.trafficfine.repository;

import com.police.trafficfine.model.FineCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FineCategoryRepository extends MongoRepository<FineCategory, String> {
    Optional<FineCategory> findByCategoryIdAndIsActiveTrue(String categoryId);
    Optional<FineCategory> findByCategoryId(String categoryId);
    List<FineCategory> findByIsActiveTrueOrderByCategoryIdAsc();
}
