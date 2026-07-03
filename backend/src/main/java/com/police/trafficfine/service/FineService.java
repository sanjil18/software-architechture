package com.police.trafficfine.service;

import com.police.trafficfine.dto.*;
import com.police.trafficfine.exception.BadRequestException;
import com.police.trafficfine.exception.ResourceNotFoundException;
import com.police.trafficfine.model.*;
import com.police.trafficfine.repository.FineCategoryRepository;
import com.police.trafficfine.repository.TrafficFineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ProjectionOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FineService {

    private final TrafficFineRepository fineRepository;
    private final FineCategoryRepository categoryRepository;
    private final SmsService smsService;
    private final MongoTemplate mongoTemplate;

    private String generateReferenceNumber() {
        int year = Instant.now().atZone(ZoneId.systemDefault()).getYear();
        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "TF-" + year + "-" + unique;
    }

    public TrafficFine issueFine(IssueFineRequest request, User officer) {
        FineCategory category = categoryRepository
                .findByCategoryIdAndIsActiveTrue(request.getCategoryId().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Fine category not found."));

        Instant dueDate = Instant.now().plus(30, ChronoUnit.DAYS);

        TrafficFine fine = TrafficFine.builder()
                .referenceNumber(generateReferenceNumber())
                .category(category)
                .categoryId(category.getCategoryId())
                .officer(officer)
                .officerPhone(officer.getPhone())
                .driverName(request.getDriverName())
                .driverLicense(request.getDriverLicense())
                .driverPhone(request.getDriverPhone())
                .vehicleNumber(request.getVehicleNumber())
                .vehicleType(request.getVehicleType() != null ? request.getVehicleType() : VehicleType.CAR)
                .amount(category.getAmount())
                .district(officer.getDistrict())
                .location(request.getLocation())
                .violation(request.getViolation())
                .issuedAt(Instant.now())
                .dueDate(dueDate)
                .status(FineStatus.PENDING)
                .build();

        fine = fineRepository.save(fine);

        if (fine.getDriverPhone() != null && !fine.getDriverPhone().isBlank()) {
            SmsService.SmsResult result = smsService.sendFineIssuedSms(
                    fine.getDriverPhone(), fine.getReferenceNumber(), fine.getViolation(),
                    fine.getVehicleNumber(), fine.getAmount(), fine.getLocation(),
                    fine.getDueDate(), fine.getCategoryId());
            fine.setIssuedSmsSent(result.success());
            fine = fineRepository.save(fine);
        }

        return fine;
    }

    public TrafficFine updateFine(String id, UpdateFineRequest request) {
        TrafficFine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found."));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new BadRequestException("Cannot edit a paid fine.");
        }

        if (request.getDriverName() != null) fine.setDriverName(request.getDriverName());
        if (request.getDriverLicense() != null) fine.setDriverLicense(request.getDriverLicense());
        if (request.getVehicleNumber() != null) fine.setVehicleNumber(request.getVehicleNumber());
        if (request.getVehicleType() != null) fine.setVehicleType(request.getVehicleType());
        if (request.getLocation() != null) fine.setLocation(request.getLocation());
        if (request.getViolation() != null) fine.setViolation(request.getViolation());
        if (request.getDistrict() != null) fine.setDistrict(request.getDistrict());
        if (request.getAmount() != null) fine.setAmount(request.getAmount());
        if (request.getDriverPhone() != null) fine.setDriverPhone(request.getDriverPhone());
        if (request.getStatus() != null) fine.setStatus(request.getStatus());

        if (request.getCategoryId() != null) {
            categoryRepository.findByCategoryId(request.getCategoryId().toUpperCase())
                    .ifPresent(cat -> {
                        fine.setCategory(cat);
                        fine.setCategoryId(cat.getCategoryId());
                        if (request.getAmount() == null) fine.setAmount(cat.getAmount());
                    });
        }

        return fineRepository.save(fine);
    }

    public FineLookupResponse lookupFine(String referenceNumber, String categoryId) {
        if (referenceNumber == null || referenceNumber.isBlank() || categoryId == null || categoryId.isBlank()) {
            throw new BadRequestException("Reference number and category ID are required.");
        }

        TrafficFine fine = fineRepository
                .findByReferenceNumberAndCategoryId(referenceNumber.toUpperCase(), categoryId.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fine not found. Please check your reference number and category ID."));

        return FineLookupResponse.from(fine);
    }

    public PayFineResponse payFine(String id, PayFineRequest request) {
        TrafficFine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found."));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new BadRequestException("This fine has already been paid.");
        }
        if (fine.getStatus() == FineStatus.CANCELLED) {
            throw new BadRequestException("This fine has been cancelled.");
        }

        fine.setStatus(FineStatus.PAID);
        fine.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.ONLINE);
        fine.setPaymentReference(request.getPaymentReference() != null && !request.getPaymentReference().isBlank()
                ? request.getPaymentReference()
                : "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        fine.setPaidAt(Instant.now());

        fine = fineRepository.save(fine);

        SmsService.SmsResult officerSms = smsService.sendPaymentConfirmationSms(
                fine.getOfficerPhone(), fine.getReferenceNumber(), fine.getDriverName(),
                fine.getVehicleNumber(), fine.getAmount(), fine.getPaidAt());
        fine.setOfficerSmsSent(officerSms.success());

        if (fine.getDriverPhone() != null && !fine.getDriverPhone().isBlank()) {
            SmsService.SmsResult driverSms = smsService.sendDriverPaymentConfirmationSms(
                    fine.getDriverPhone(), fine.getReferenceNumber(), fine.getAmount(), fine.getPaidAt());
            fine.setDriverSmsSent(driverSms.success());
        }

        fine = fineRepository.save(fine);

        return PayFineResponse.builder()
                .referenceNumber(fine.getReferenceNumber())
                .amount(fine.getAmount())
                .status(fine.getStatus())
                .paymentReference(fine.getPaymentReference())
                .paidAt(fine.getPaidAt())
                .officerSmsSent(fine.isOfficerSmsSent())
                .driverSmsSent(fine.isDriverSmsSent())
                .build();
    }

    public PagedFinesResponse getMyFines(User officer, FineStatus status, int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);
        PageRequest pageRequest = PageRequest.of(safePage - 1, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<TrafficFine> result = status != null
                ? fineRepository.findByOfficerAndStatus(officer, status, pageRequest)
                : fineRepository.findByOfficer(officer, pageRequest);

        return PagedFinesResponse.builder()
                .success(true)
                .count(result.getNumberOfElements())
                .total(result.getTotalElements())
                .pages(result.getTotalPages())
                .page(safePage)
                .fines(result.getContent())
                .build();
    }

    public PagedFinesResponse getAllFines(FineStatus status, String district, String categoryId, int page, int limit) {
        Criteria criteria = new Criteria();
        List<Criteria> parts = new java.util.ArrayList<>();
        if (status != null) parts.add(Criteria.where("status").is(status));
        if (district != null && !district.isBlank()) parts.add(Criteria.where("district").is(district));
        if (categoryId != null && !categoryId.isBlank()) parts.add(Criteria.where("categoryId").is(categoryId.toUpperCase()));

        if (!parts.isEmpty()) {
            criteria = new Criteria().andOperator(parts.toArray(new Criteria[0]));
        }

        return queryFines(criteria, page, limit);
    }

    private PagedFinesResponse queryFines(Criteria criteria, int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);

        Query query = new Query(criteria).with(Sort.by(Sort.Direction.DESC, "createdAt"));
        long total = mongoTemplate.count(query, TrafficFine.class);

        query.skip((long) (safePage - 1) * safeLimit).limit(safeLimit);
        List<TrafficFine> fines = mongoTemplate.find(query, TrafficFine.class);

        return PagedFinesResponse.builder()
                .success(true)
                .count(fines.size())
                .total(total)
                .pages((int) Math.ceil((double) total / safeLimit))
                .page(safePage)
                .fines(fines)
                .build();
    }

    /**
     * Equivalent of controllers/fineController.js#getAnalytics — same set of
     * aggregations (overview totals, district/category/payment-method
     * breakdowns, 6-month trend), built with Spring Data MongoDB's
     * aggregation framework instead of raw Mongoose pipelines.
     */
    public Map<String, Object> getAnalytics() {
        long totalFines = fineRepository.count();
        long paidFines = fineRepository.countByStatus(FineStatus.PAID);
        long pendingFines = fineRepository.countByStatus(FineStatus.PENDING);
        long overdueFines = fineRepository.countByStatus(FineStatus.OVERDUE);

        double totalRevenue = sumAmountWhere(Criteria.where("status").is(FineStatus.PAID));

        List<Map> districtStats = groupBy("district", Criteria.where("status").is(FineStatus.PAID));
        List<Map> categoryStats = groupBy("categoryId", Criteria.where("status").is(FineStatus.PAID));

        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        List<Map> monthlyTrend = monthlyTrend(sixMonthsAgo);

        List<Map> paymentMethodStats = groupBy("paymentMethod", Criteria.where("status").is(FineStatus.PAID));

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalFines", totalFines);
        overview.put("paidFines", paidFines);
        overview.put("pendingFines", pendingFines);
        overview.put("overdueFines", overdueFines);
        overview.put("totalRevenue", totalRevenue);
        overview.put("collectionRate", totalFines > 0
                ? Math.round((paidFines * 1000.0 / totalFines)) / 10.0
                : 0);

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("overview", overview);
        analytics.put("districtStats", districtStats);
        analytics.put("categoryStats", categoryStats);
        analytics.put("monthlyTrend", monthlyTrend);
        analytics.put("paymentMethodStats", paymentMethodStats);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("analytics", analytics);
        return result;
    }

    private double sumAmountWhere(Criteria criteria) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.group().sum("amount").as("total")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "traffic_fines", Map.class);
        Map first = results.getUniqueMappedResult();
        if (first == null || first.get("total") == null) return 0.0;
        return ((Number) first.get("total")).doubleValue();
    }

    @SuppressWarnings("unchecked")
    private List<Map> groupBy(String field, Criteria matchCriteria) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(matchCriteria),
                Aggregation.group(field).sum("amount").as("totalAmount").count().as("count"),
                Aggregation.sort(Sort.Direction.DESC, "totalAmount")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "traffic_fines", Map.class);
        return results.getMappedResults();
    }

    @SuppressWarnings("unchecked")
    private List<Map> monthlyTrend(Instant since) {
        ProjectionOperation project = Aggregation.project("amount", "paidAt")
                .andExpression("year(paidAt)").as("year")
                .andExpression("month(paidAt)").as("month");

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is(FineStatus.PAID).and("paidAt").gte(since)),
                project,
                Aggregation.group("year", "month").sum("amount").as("totalAmount").count().as("count"),
                Aggregation.sort(Sort.Direction.ASC, "_id.year", "_id.month")
        );
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "traffic_fines", Map.class);
        return results.getMappedResults();
    }
}
