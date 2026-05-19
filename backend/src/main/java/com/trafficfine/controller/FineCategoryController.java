package com.trafficfine.controller;

import com.trafficfine.entity.FineCategory;
import com.trafficfine.repository.FineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FineCategoryController {

    private final FineCategoryRepository categoryRepository;

    /** Public endpoint - drivers/officers need to know categories */
    @GetMapping
    public ResponseEntity<List<FineCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineCategory> createCategory(@RequestBody FineCategory category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineCategory> updateCategory(@PathVariable Long id, @RequestBody FineCategory updated) {
        FineCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setName(updated.getName());
        cat.setDescription(updated.getDescription());
        cat.setDefaultAmount(updated.getDefaultAmount());
        return ResponseEntity.ok(categoryRepository.save(cat));
    }
}
