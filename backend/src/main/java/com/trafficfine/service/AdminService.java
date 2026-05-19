package com.trafficfine.service;

import com.trafficfine.repository.TrafficFineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TrafficFineRepository fineRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCollection", fineRepository.findTotalCollection());
        stats.put("totalPaid", fineRepository.countByStatus(com.trafficfine.entity.TrafficFine.FineStatus.PAID));
        stats.put("totalPending", fineRepository.countByStatus(com.trafficfine.entity.TrafficFine.FineStatus.PENDING));
        stats.put("totalFines", fineRepository.count());
        return stats;
    }

    public List<Map<String, Object>> getDistrictCollections() {
        List<Object[]> raw = fineRepository.findCollectionByDistrict();
        return raw.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("district", row[0]);
            map.put("totalAmount", row[1]);
            return map;
        }).toList();
    }

    public List<Map<String, Object>> getCategoryCollections() {
        List<Object[]> raw = fineRepository.findCollectionByCategory();
        return raw.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", row[0]);
            map.put("count", row[1]);
            map.put("totalAmount", row[2]);
            return map;
        }).toList();
    }
}
