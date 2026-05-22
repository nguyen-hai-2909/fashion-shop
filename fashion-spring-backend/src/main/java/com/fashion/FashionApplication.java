package com.fashion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class FashionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FashionApplication.class, args);
    }
}
