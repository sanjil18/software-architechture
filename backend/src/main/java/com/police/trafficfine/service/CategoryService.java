package com.police.trafficfine.service;

import com.police.trafficfine.dto.CategoryRequest;
import com.police.trafficfine.exception.ResourceNotFoundException;
import com.police.trafficfine.model.FineCategory;
import com.police.trafficfine.repository.FineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final FineCategoryRepository categoryRepository;

    public List<FineCategory> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByCategoryIdAsc();
    }

    public FineCategory createCategory(CategoryRequest request) {
        FineCategory category = FineCategory.builder()
                .categoryId(request.getCategoryId().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .amount(request.getAmount())
                .points(request.getPoints() != null ? request.getPoints() : 0)
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();
        return categoryRepository.save(category);
    }

    public FineCategory updateCategory(String id, CategoryRequest request) {
        FineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        if (request.getCategoryId() != null) category.setCategoryId(request.getCategoryId().toUpperCase());
        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getAmount() != null) category.setAmount(request.getAmount());
        if (request.getPoints() != null) category.setPoints(request.getPoints());
        if (request.getIsActive() != null) category.setActive(request.getIsActive());

        return categoryRepository.save(category);
    }
}
