package com.fashion.config;

import com.fashion.document.Category;
import com.fashion.document.Product;
import com.fashion.document.User;
import com.fashion.repository.CategoryRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Seed dữ liệu mẫu cho fashion store khi DB trống.
 */
@Component
@RequiredArgsConstructor
public class FashionDataSeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() == 0) {
            Category nam = categoryRepository.save(cat("Thời trang Nam", "thoi-trang-nam", null, 0));
            categoryRepository.save(cat("Áo nam", "ao-nam", nam.getId(), 1));
            categoryRepository.save(cat("Quần nam", "quan-nam", nam.getId(), 2));
            Category nu = categoryRepository.save(cat("Thời trang Nữ", "thoi-trang-nu", null, 3));
            categoryRepository.save(cat("Váy", "vay", nu.getId(), 4));
            Category acc = categoryRepository.save(cat("Phụ kiện", "phu-kien", null, 5));
            categoryRepository.save(cat("Giày & túi", "giay-tui", acc.getId(), 6));
        }

        ensureUser("admin@fashion.local", "0900000000", "Fashion Admin", "admin123", "admin");
        ensureUser("manager@fashion.local", "0900000002", "Fashion Manager", "manager123", "manager");
        ensureUser("staff@fashion.local", "0900000003", "Fashion Staff", "staff123", "staff");
        ensureUser("user@fashion.local", "0900000001", "Fashion Customer", "user123", "customer");

        ensureProduct(
                "Áo polo nam basic",
                "ao-polo-nam-basic",
                "ao-nam",
                "uniqlo",
                "male",
                List.of("basic", "cotton"),
                true,
                variant("APL-BLK-M", "Black", "#000000", "M", 299000d, 399000d, 24),
                variant("APL-WHT-L", "White", "#ffffff", "L", 299000d, 399000d, 18)
        );
        ensureProduct(
                "Quần jean nam slim fit",
                "quan-jean-nam-slim-fit",
                "quan-nam",
                "levis",
                "male",
                List.of("jean", "slim-fit"),
                false,
                variant("QJN-IND-30", "Indigo", "#2F4F8F", "30", 699000d, 899000d, 20),
                variant("QJN-BLK-32", "Black", "#1f1f1f", "32", 699000d, 899000d, 16)
        );
        ensureProduct(
                "Váy midi nữ thanh lịch",
                "vay-midi-nu-thanh-lich",
                "vay",
                "zara",
                "female",
                List.of("dress", "office"),
                true,
                variant("VMN-CRM-S", "Cream", "#E8D4B8", "S", 549000d, 699000d, 15),
                variant("VMN-BLK-M", "Black", "#000000", "M", 549000d, 699000d, 12)
        );
        ensureProduct(
                "Sneaker unisex daily",
                "sneaker-unisex-daily",
                "giay-tui",
                "nike",
                "unisex",
                List.of("sneaker", "daily"),
                false,
                variant("SUD-WHT-40", "White", "#ffffff", "40", 899000d, 1099000d, 10),
                variant("SUD-GRY-41", "Gray", "#9E9E9E", "41", 899000d, 1099000d, 8)
        );
    }

    private void ensureProduct(
            String name,
            String slug,
            String category,
            String brand,
            String gender,
            List<String> tags,
            boolean featured,
            Product.ProductVariant... variants
    ) {
        if (productRepository.findBySlug(slug).isPresent()) {
            return;
        }
        productRepository.save(product(name, slug, category, brand, gender, tags, featured, variants));
    }

    private void ensureUser(String email, String phone, String fullName, String rawPassword, String role) {
        if (userRepository.existsByEmail(email) || userRepository.existsByPhone(phone)) {
            return;
        }
        User user = new User();
        user.setEmail(email);
        user.setPhone(phone);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
    }

    private static Category cat(String name, String slug, String parentId, int sort) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setParentId(parentId);
        c.setSortOrder(sort);
        c.setIsActive(true);
        return c;
    }

    private static Product product(
            String name,
            String slug,
            String category,
            String brand,
            String gender,
            List<String> tags,
            boolean featured,
            Product.ProductVariant... variants
    ) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setDescription("");
        p.setCategory(category);
        p.setBrand(brand);
        p.setGender(gender);
        p.setTags(new ArrayList<>(tags));
        p.setStatus("active");
        p.setIsFeatured(featured);
        p.setVariants(new ArrayList<>(List.of(variants)));
        p.setPublishedAt(Instant.now());
        return p;
    }

    private static Product.ProductVariant variant(
            String sku,
            String colorName,
            String colorHex,
            String size,
            double price,
            double compareAtPrice,
            int inventory
    ) {
        Product.ProductVariant v = new Product.ProductVariant();
        v.setId(UUID.randomUUID().toString());
        v.setSku(sku);
        Product.ColorEmb color = new Product.ColorEmb();
        color.setName(colorName);
        color.setHex(colorHex);
        v.setColor(color);
        v.setSize(size);
        v.setPrice(price);
        v.setCompareAtPrice(compareAtPrice);
        v.setInventory(inventory);
        v.setIsActive(true);
        return v;
    }
}
