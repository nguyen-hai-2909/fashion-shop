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
@Document(collection = "users")
public class User {

    @Id
    @JsonProperty("_id")
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed
    private String phone;

    private String password;

    @Field("full_name")
    private String fullName;

    @Field("avatar_url")
    private String avatarUrl;

    /** "customer" | "admin" */
    private String role = "customer";

    private List<UserAddress> addresses = new ArrayList<>();

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private Instant updatedAt;
}
