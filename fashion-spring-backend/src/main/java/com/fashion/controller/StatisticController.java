package com.fashion.controller;

import com.fashion.service.AdminAuthorizationService;
import com.fashion.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/statistic")
@RequiredArgsConstructor
public class StatisticController {

    private final StatisticService statisticService;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping({"", "/"})
    public ResponseEntity<?> stat(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(statisticService.getStatistic(startDate, endDate));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
