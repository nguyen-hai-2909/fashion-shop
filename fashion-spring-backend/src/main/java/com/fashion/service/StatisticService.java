package com.fashion.service;

import com.fashion.document.Order;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatisticService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public Map<String, Object> getStatistic(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate).plusDays(1);
        Instant gte = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant lt = end.atStartOfDay(ZoneOffset.UTC).toInstant();

        long countUser = userRepository.findAll().stream()
                .filter(u -> !"admin".equalsIgnoreCase(u.getRole()))
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(gte) && u.getCreatedAt().isBefore(lt))
                .count();
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(gte) && o.getCreatedAt().isBefore(lt))
                .toList();
        long countOrder = orders.size();
        double revenue = orders.stream()
                .filter(this::countsTowardRevenue)
                .mapToDouble(o -> o.getTotal() != null ? o.getTotal() : 0)
                .sum();

        List<Map<String, Object>> orderData = aggregateByDay(orders);

        return Map.of(
                "success", true,
                "message", "Success!",
                "orderData", orderData,
                "dataCount", Map.of(
                        "orders", countOrder,
                        "users", countUser,
                        "revenue", revenue
                )
        );
    }

    private boolean countsTowardRevenue(Order o) {
        return o != null && !"cancelled".equalsIgnoreCase(o.getStatus());
    }

    private List<Map<String, Object>> aggregateByDay(List<Order> orders) {
        Map<String, Map<String, Object>> byDay = new LinkedHashMap<>();
        for (Order o : orders) {
            String date = o.getCreatedAt().toString().substring(0, 10);
            double orderTotal = countsTowardRevenue(o) && o.getTotal() != null ? o.getTotal() : 0;
            byDay.compute(date, (k, v) -> {
                if (v == null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", date);
                    m.put("sum", 1);
                    m.put("totalCurrentPrice", orderTotal);
                    return m;
                }
                v.put("sum", ((Number) v.get("sum")).intValue() + 1);
                double t = ((Number) v.get("totalCurrentPrice")).doubleValue() + orderTotal;
                v.put("totalCurrentPrice", t);
                return v;
            });
        }
        return new ArrayList<>(byDay.values());
    }
}
