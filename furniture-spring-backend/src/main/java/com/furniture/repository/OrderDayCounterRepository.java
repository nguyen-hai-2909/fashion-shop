package com.furniture.repository;

import com.furniture.document.OrderDayCounter;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderDayCounterRepository extends MongoRepository<OrderDayCounter, String> {
}
