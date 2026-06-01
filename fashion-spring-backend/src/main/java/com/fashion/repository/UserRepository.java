package com.fashion.repository;

import com.fashion.document.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    List<User> findAllByEmail(String email);
    Optional<User> findByEmailAndRole(String email, String role);
    List<User> findByRole(String role);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
