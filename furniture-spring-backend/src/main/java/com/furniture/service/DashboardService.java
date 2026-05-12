package com.furniture.service;

import com.furniture.document.Order;
import com.furniture.repository.FashionDiscountRepository;
import com.furniture.repository.OrderRepository;
import com.furniture.repository.ProductRepository;
import com.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FashionDiscountRepository discountRepository;

    public Map<String, Object> getDashboard() {
        long countOrder = orderRepository.count();
        long countProduct = productRepository.count();
        long countUser = userRepository.findAll().stream().filter(u -> !"admin".equalsIgnoreCase(u.getRole())).count();
        long discountCount = discountRepository.count();

        Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
        List<Order> recent = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(since))
                .toList();

        List<Map<String, Object>> orderData = aggregateByDay(recent);

        return Map.of(
                "success", true,
                "message", "Success!",
                "countNumber", Map.of(
                        "orders", countOrder,
                        "products", countProduct,
                        "users", countUser,
                        "discounts", discountCount
                ),
                "orderData", orderData
        );
    }

    private List<Map<String, Object>> aggregateByDay(List<Order> orders) {
        Map<String, Map<String, Object>> byDay = new LinkedHashMap<>();
        for (Order o : orders) {
            String date = o.getCreatedAt().toString().substring(0, 10);
            byDay.compute(date, (k, v) -> {
                if (v == null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", date);
                    m.put("sum", 1);
                    m.put("totalCurrentPrice", o.getTotal() != null ? o.getTotal() : 0);
                    return m;
                }
                v.put("sum", ((Number) v.get("sum")).intValue() + 1);
                double t = ((Number) v.get("totalCurrentPrice")).doubleValue()
                        + (o.getTotal() != null ? o.getTotal() : 0);
                v.put("totalCurrentPrice", t);
                return v;
            });
        }
        return new ArrayList<>(byDay.values());
    }
}
