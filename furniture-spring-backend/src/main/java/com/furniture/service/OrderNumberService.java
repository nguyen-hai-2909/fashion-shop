package com.furniture.service;

import com.furniture.document.OrderDayCounter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final MongoTemplate mongoTemplate;

    /** ORD-YYYYMMDD-XXXX (sequence per day) */
    public String nextOrderNumber() {
        String day = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        Query q = Query.query(Criteria.where("_id").is(day));
        Update u = new Update().inc("seq", 1);
        FindAndModifyOptions opts = new FindAndModifyOptions().upsert(true).returnNew(true);
        OrderDayCounter counter = mongoTemplate.findAndModify(q, u, opts, OrderDayCounter.class);
        long n = counter != null ? counter.getSeq() : 1;
        return "ORD-" + day + "-" + String.format("%04d", n);
    }
}
