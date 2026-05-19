package com.trafficfine.repository;

import com.trafficfine.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {
    Optional<Officer> findByBadgeNumber(String badgeNumber);
    Optional<Officer> findByPhoneNumber(String phoneNumber);
}
