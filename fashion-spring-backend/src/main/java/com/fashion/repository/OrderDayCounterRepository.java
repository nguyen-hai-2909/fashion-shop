package com.fashion.repository;

import com.fashion.document.OrderDayCounter;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderDayCounterRepository extends MongoRepository<OrderDayCounter, String> {
}
