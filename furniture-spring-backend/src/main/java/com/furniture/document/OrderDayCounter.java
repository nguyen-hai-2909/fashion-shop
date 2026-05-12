package com.furniture.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "order_counters")
public class OrderDayCounter {

    @Id
    private String id;

    private long seq;
}
