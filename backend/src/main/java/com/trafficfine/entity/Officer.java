package com.trafficfine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "officers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Officer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String badgeNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String station;

    @OneToOne(mappedBy = "officer")
    private User user;
}
