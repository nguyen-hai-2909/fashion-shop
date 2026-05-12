package com.furniture.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {

    @Id
    @JsonProperty("_id")
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    /** slug category, e.g. ao-nam */
    private String category;

    private String brand;

    /** male | female | unisex */
    private String gender;

    private List<String> tags = new ArrayList<>();

    /** active | draft | archived */
    private String status = "active";

    @Field("is_featured")
    private Boolean isFeatured = false;

    private List<ProductImage> images = new ArrayList<>();

    private List<ProductVariant> variants = new ArrayList<>();

    @Field("published_at")
    private Instant publishedAt;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    @Data
    public static class ProductImage {
        private String url;
        private String alt;
        private Integer position;
    }

    @Data
    public static class ColorEmb {
        private String name;
        private String hex;
    }

    @Data
    public static class ProductVariant {
        @Field("_id")
        @JsonProperty("_id")
        private String id;

        private String sku;

        private ColorEmb color;
        private String size;

        private Double price;
        @Field("compare_at_price")
        private Double compareAtPrice;

        private Integer inventory = 0;

        @Field("image_url")
        private String imageUrl;

        @Field("is_active")
        private Boolean isActive = true;
    }
}
