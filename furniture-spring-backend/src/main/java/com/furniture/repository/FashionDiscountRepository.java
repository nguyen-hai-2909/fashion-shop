package com.furniture.repository;

import com.furniture.document.FashionDiscount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FashionDiscountRepository extends MongoRepository<FashionDiscount, String> {
    Optional<FashionDiscount> findByCodeIgnoreCase(String code);
}
