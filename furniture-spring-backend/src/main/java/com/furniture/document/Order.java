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
import java.util.Map;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    @Field("order_number")
    private String orderNumber;

    @Field("user_id")
    private String userId;

    @Field("user_email")
    private String userEmail;

    /** pending | confirmed | shipping | delivered | cancelled */
    private String status = "pending";

    @Field("status_logs")
    private List<StatusLog> statusLogs = new ArrayList<>();

    @Field("shipping_address")
    private ShippingSnapshot shippingAddress;

    private List<OrderItem> items = new ArrayList<>();

    private Payment payment;

    private Map<String, Object> discount;

    private Double subtotal;
    @Field("discount_amount")
    private Double discountAmount;
    @Field("shipping_fee")
    private Double shippingFee;
    private Double total;

    private String note;
    @Field("cancel_reason")
    private String cancelReason;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;

    @Data
    public static class StatusLog {
        private String status;
        private Instant at;
        private String note;
    }

    @Data
    public static class ShippingSnapshot {
        @Field("recipient_name")
        private String recipientName;
        private String phone;
        private String address;
        private String district;
        private String city;
    }

    @Data
    public static class OrderItem {
        @Field("product_id")
        private String productId;
        @Field("variant_id")
        private String variantId;
        @Field("product_name")
        private String productName;
        @Field("variant_title")
        private String variantTitle;
        private String sku;
        @Field("image_url")
        private String imageUrl;
        private Integer quantity;
        @Field("unit_price")
        private Double unitPrice;
        private Double subtotal;
        private Integer rating;
        private String comment;
        @Field("reviewed_at")
        private Instant reviewedAt;
    }

    @Data
    public static class Payment {
        private String method;
        private String status;
        @Field("paid_at")
        private Instant paidAt;
    }
}
