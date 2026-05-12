package com.furniture.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Document(collection = "discounts")
public class FashionDiscount {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String code;

    private String description;

    /** percentage | fixed_amount | free_shipping */
    private String type;

    private Double value;

    @Field("min_order_amount")
    private Double minOrderAmount;

    @Field("usage_limit")
    private Integer usageLimit;

    @Field("usage_count")
    private Integer usageCount = 0;

    @Field("once_per_user")
    private Boolean oncePerUser = false;

    @Field("is_active")
    private Boolean isActive = true;

    @Field("starts_at")
    private Instant startsAt;

    @Field("ends_at")
    private Instant endsAt;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;
}
