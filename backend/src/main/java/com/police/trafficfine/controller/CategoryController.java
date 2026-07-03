package com.police.trafficfine.controller;

import com.police.trafficfine.dto.CategoryRequest;
import com.police.trafficfine.model.FineCategory;
import com.police.trafficfine.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Equivalent of routes/categoryRoutes.js:
 *   GET  /api/categories      -> public
 *   POST /api/categories      -> protect + authorize('admin')
 *   PUT  /api/categories/:id  -> protect + authorize('admin')
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCategories() {
        List<FineCategory> categories = categoryService.getActiveCategories();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("count", categories.size());
        body.put("categories", categories);
        return ResponseEntity.ok(body);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(@Valid @RequestBody CategoryRequest request) {
        FineCategory category = categoryService.createCategory(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("category", category);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable String id,
                                                                @RequestBody CategoryRequest request) {
        FineCategory category = categoryService.updateCategory(id, request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("category", category);
        return ResponseEntity.ok(body);
    }
}
