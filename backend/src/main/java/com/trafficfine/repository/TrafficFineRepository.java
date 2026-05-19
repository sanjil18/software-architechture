package com.trafficfine.repository;

import com.trafficfine.entity.TrafficFine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrafficFineRepository extends JpaRepository<TrafficFine, Long> {

    Optional<TrafficFine> findByReferenceNumber(String referenceNumber);

    Optional<TrafficFine> findByReferenceNumberAndCategory_CategoryCode(String referenceNumber, String categoryCode);

    List<TrafficFine> findByStatus(TrafficFine.FineStatus status);

    List<TrafficFine> findByDistrict(String district);

    @Query("SELECT tf.district, SUM(tf.amount) FROM TrafficFine tf WHERE tf.status = 'PAID' GROUP BY tf.district")
    List<Object[]> findCollectionByDistrict();

    @Query("SELECT tf.category.name, COUNT(tf), SUM(tf.amount) FROM TrafficFine tf WHERE tf.status = 'PAID' GROUP BY tf.category")
    List<Object[]> findCollectionByCategory();

    @Query("SELECT tf FROM TrafficFine tf WHERE tf.issuedAt BETWEEN :start AND :end")
    List<TrafficFine> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(tf.amount) FROM TrafficFine tf WHERE tf.status = 'PAID'")
    java.math.BigDecimal findTotalCollection();

    long countByStatus(TrafficFine.FineStatus status);
}
