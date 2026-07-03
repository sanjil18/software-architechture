package com.police.trafficfine.dto;

import com.police.trafficfine.model.TrafficFine;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedFinesResponse {
    private boolean success;
    private int count;
    private long total;
    private int pages;
    private int page;
    private List<TrafficFine> fines;
}
