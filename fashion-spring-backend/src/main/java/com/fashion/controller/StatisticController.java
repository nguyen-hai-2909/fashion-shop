package com.fashion.controller;

import com.fashion.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/statistic")
@RequiredArgsConstructor
public class StatisticController {

    private final StatisticService statisticService;

    @GetMapping({"", "/"})
    public ResponseEntity<?> stat(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(statisticService.getStatistic(startDate, endDate));
    }
}
