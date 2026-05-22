package com.fashion.repository;

import com.fashion.document.FashionDiscount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FashionDiscountRepository extends MongoRepository<FashionDiscount, String> {
    Optional<FashionDiscount> findByCodeIgnoreCase(String code);
}
