package com.fashion.document;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
public class UserAddress {

    @Field("_id")
    private String id;

    private String label;
    @Field("recipient_name")
    private String recipientName;
    private String phone;
    private String address;
    private String district;
    private String city;
    @Field("is_default")
    private Boolean isDefault = false;
}
