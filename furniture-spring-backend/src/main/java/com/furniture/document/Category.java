package com.furniture.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "categories")
public class Category {

    @Id
    @JsonProperty("_id")
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    @Field("parent_id")
    private String parentId;

    @Field("image_url")
    private String imageUrl;

    @Field("sort_order")
    private Integer sortOrder = 0;

    @Field("is_active")
    private Boolean isActive = true;
}
