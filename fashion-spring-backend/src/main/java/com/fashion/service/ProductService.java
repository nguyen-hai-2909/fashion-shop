package com.fashion.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fashion.document.Product;
import com.fashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public Map<String, Object> create(Map<String, String> form) {
        try {
            Product p = new Product();
            p.setName(form.get("name"));
            p.setSlug(uniqueSlug(form.get("name")));
            p.setBrand(form.get("company") != null ? form.get("company") : form.get("brand"));
            p.setCategory(form.get("category"));
            p.setDescription(form.get("description"));
            p.setGender(form.getOrDefault("gender", "unisex"));
            p.setStatus(normalizeProductStatus(form.get("status")));
            p.setImages(parseImages(form.get("images")));
            p.setVariants(buildVariants(form, p.getSlug()));
            p.setPublishedAt(java.time.Instant.now());
            Product saved = productRepository.save(p);
            return Map.of("success", true, "message", "Create product success🎉!", "data", toClientProduct(saved));
        } catch (Exception e) {
            return Map.of("success", false, "message", "Something went wrong!", "error", e.getMessage());
        }
    }

    private List<Product.ProductImage> parseImages(String json) throws Exception {
        if (json == null) return List.of();
        List<Map<String, Object>> raw = objectMapper.readValue(json, new TypeReference<>() {
        });
        List<Product.ProductImage> list = new ArrayList<>();
        int i = 0;
        for (Map<String, Object> m : raw) {
            Product.ProductImage img = new Product.ProductImage();
            img.setUrl(Objects.toString(m.get("url"), ""));
            img.setAlt(Objects.toString(m.get("name"), ""));
            img.setPosition(i++);
            list.add(img);
        }
        return list;
    }

    private List<Product.ProductVariant> buildVariants(Map<String, String> form, String slug) throws Exception {
        if (form.containsKey("variants") && form.get("variants") != null) {
            return objectMapper.readValue(form.get("variants"), new TypeReference<>() {
            });
        }
        String stockJson = form.get("stock");
        double basePrice = Double.parseDouble(form.getOrDefault("price", "0"));
        List<Map<String, Object>> stock = objectMapper.readValue(stockJson, new TypeReference<>() {
        });
        List<Product.ProductVariant> out = new ArrayList<>();
        int i = 0;
        for (Map<String, Object> row : stock) {
            Product.ProductVariant v = new Product.ProductVariant();
            v.setId(new ObjectId().toHexString());
            String colorName = Objects.toString(row.get("color"), "Default");
            Product.ColorEmb c = new Product.ColorEmb();
            c.setName(colorName);
            c.setHex("#000000");
            v.setColor(c);
            v.setSize("M");
            v.setPrice(parseDouble(row.get("price"), basePrice));
            Object cap = row.get("compareAtPrice");
            if (cap == null) cap = row.get("compare_at_price");
            v.setCompareAtPrice(cap != null ? parseDouble(cap, 0) : null);
            v.setInventory(parseInt(row.get("amount"), 0));
            v.setSku((slug + "-" + colorName + "-M").replaceAll("\\s+", "-").toUpperCase(Locale.ROOT) + "-" + (i++));
            v.setIsActive(true);
            out.add(v);
        }
        return out;
    }

    private static double parseDouble(Object value, double defaultValue) {
        if (value == null) return defaultValue;
        if (value instanceof Number n) return n.doubleValue();
        String s = String.valueOf(value).trim();
        if (s.isEmpty()) return defaultValue;
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static int parseInt(Object value, int defaultValue) {
        if (value == null) return defaultValue;
        if (value instanceof Number n) return n.intValue();
        String s = String.valueOf(value).trim();
        if (s.isEmpty()) return defaultValue;
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /** active | draft | archived — invalid values default to active */
    private static String normalizeProductStatus(String raw) {
        if (raw == null || raw.isBlank()) return "active";
        String t = raw.trim().toLowerCase(Locale.ROOT);
        if ("active".equals(t) || "draft".equals(t) || "archived".equals(t)) return t;
        return "active";
    }

    private String uniqueSlug(String name) {
        String base = slugify(name);
        String s = base;
        int n = 0;
        while (productRepository.findBySlug(s).isPresent()) {
            s = base + "-" + (++n);
        }
        return s;
    }

    private static String slugify(String input) {
        if (input == null) return "sp-" + System.currentTimeMillis();
        String n = Normalizer.normalize(input, Normalizer.Form.NFD);
        n = Pattern.compile("\\p{M}").matcher(n).replaceAll("");
        return n.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "")
                + "-" + Integer.toHexString(new Random().nextInt(4096));
    }

    public Map<String, Object> getAll(Map<String, String> query) {
        try {
            List<Product> list = productRepository.findAll().stream()
                    .filter(p -> "active".equals(p.getStatus()))
                    .collect(Collectors.toCollection(ArrayList::new));

            String name = query.get("name");
            String category = query.get("category");
            String company = query.get("company");
            String brand = query.get("brand");
            String gender = query.get("gender");
            String price = query.get("price");
            String color = query.get("color");
            String sort = query.get("sort");

            if (name != null && !name.isBlank()) {
                String n = name.toLowerCase();
                list = list.stream()
                        .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(n))
                        .collect(Collectors.toCollection(ArrayList::new));
            }
            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                list = list.stream().filter(p -> category.equals(p.getCategory())).collect(Collectors.toCollection(ArrayList::new));
            }
            String brandQ = brand != null && !brand.isBlank() ? brand : company;
            if (brandQ != null && !brandQ.isBlank() && !"all".equalsIgnoreCase(brandQ.trim())) {
                String b = brandQ.toLowerCase();
                list = list.stream()
                        .filter(p -> p.getBrand() != null && p.getBrand().toLowerCase().contains(b))
                        .collect(Collectors.toCollection(ArrayList::new));
            }
            if (gender != null && !gender.isBlank()) {
                list = list.stream()
                        .filter(p -> gender.equalsIgnoreCase(p.getGender()) || "unisex".equalsIgnoreCase(p.getGender()))
                        .collect(Collectors.toCollection(ArrayList::new));
            }
            if (price != null && !price.isBlank()) {
                int maxPrice = Integer.parseInt(price);
                list = list.stream()
                        .filter(p -> minVariantPrice(p) <= maxPrice)
                        .collect(Collectors.toCollection(ArrayList::new));
            }
            if (color != null && !color.isBlank()) {
                list = list.stream()
                        .filter(p -> p.getVariants() != null && p.getVariants().stream().anyMatch(v ->
                                v.getColor() != null && color.equalsIgnoreCase(v.getColor().getName())))
                        .collect(Collectors.toCollection(ArrayList::new));
            }

            if (list.isEmpty()) {
                return Map.of("statusCode", 204, "msg", "Do not have products!!!", "products", List.of());
            }

            if ("priceLowest".equals(sort)) {
                list.sort(Comparator.comparing(this::minVariantPrice));
            } else if ("priceHighest".equals(sort)) {
                list.sort(Comparator.comparing(this::minVariantPrice).reversed());
            } else if ("nameA".equals(sort)) {
                list.sort(Comparator.comparing(Product::getName, Comparator.nullsFirst(String::compareTo)));
            } else if ("nameZ".equals(sort)) {
                list.sort(Comparator.comparing(Product::getName, Comparator.nullsFirst(String::compareTo)).reversed());
            }

            List<Map<String, Object>> client = list.stream().map(this::toClientProduct).toList();
            return Map.of("msg", "success", "products", client);
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    private double minVariantPrice(Product p) {
        return listPricing(p).get("price");
    }

    /** Lowest-variant selling price and its compare-at price for catalog cards. */
    private Map<String, Double> listPricing(Product p) {
        Map<String, Double> out = new LinkedHashMap<>();
        out.put("price", 0.0);
        out.put("compareAtPrice", null);
        if (p.getVariants() == null || p.getVariants().isEmpty()) {
            return out;
        }
        Product.ProductVariant best = null;
        double min = Double.MAX_VALUE;
        for (Product.ProductVariant v : p.getVariants()) {
            if (Boolean.FALSE.equals(v.getIsActive())) continue;
            double price = v.getPrice() != null ? v.getPrice() : 0;
            if (price > 0 && price < min) {
                min = price;
                best = v;
            }
        }
        if (best == null) {
            return out;
        }
        out.put("price", min);
        Double compare = resolveVariantCompareAtPrice(best);
        if (compare != null && compare > min) {
            out.put("compareAtPrice", compare);
        }
        return out;
    }

    /** Compare applies only when variant selling price is not above compare-at. */
    private static Double resolveVariantCompareAtPrice(Product.ProductVariant v) {
        if (v == null || v.getCompareAtPrice() == null) return null;
        double price = v.getPrice() != null ? v.getPrice() : 0;
        double compare = v.getCompareAtPrice();
        if (price > compare) return null;
        return compare;
    }

    /** Public product page / API: only active products; accepts Mongo id or slug. */
    public Map<String, Object> getOne(String identifier) {
        Optional<Product> productOpt = findByIdOrSlug(identifier);
        return productOpt
                .filter(p -> "active".equals(p.getStatus()))
                .map(p -> Map.<String, Object>of("success", true, "message", "success", "product", toClientProduct(p)))
                .orElse(Map.of("success", false, "message", "Product is not exist!"));
    }

    private Optional<Product> findByIdOrSlug(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        String value = identifier.trim();
        if (ObjectId.isValid(value)) {
            Optional<Product> byId = productRepository.findById(value);
            if (byId.isPresent()) return byId;
        }
        return productRepository.findBySlug(value);
    }

    /** Admin: load any status for edit. */
    public Map<String, Object> getOneAnyStatus(String id) {
        return productRepository.findById(id)
                .map(p -> Map.<String, Object>of("success", true, "message", "success", "product", toClientProduct(p)))
                .orElse(Map.of("success", false, "message", "Product is not exist!"));
    }

    public Map<String, Object> toggleActive(String id) {
        Product p = productRepository.findById(id).orElse(null);
        if (p == null) {
            return Map.of("success", false, "message", "Product is not exist!");
        }
        if ("active".equalsIgnoreCase(Objects.toString(p.getStatus(), ""))) {
            p.setStatus("draft");
        } else {
            p.setStatus("active");
        }
        productRepository.save(p);
        return Map.of("success", true, "message", "Store visibility updated", "data", toClientProduct(p));
    }

    public Map<String, Object> delete(String id) {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return Map.of("errCode", 1, "msg", "Product is not exist!");
        }
        productRepository.deleteById(id);
        return Map.of("msg", "Delete successful!", "productData", toClientProduct(opt.get()));
    }

    public Map<String, Object> update(String id, Map<String, String> form) {
        try {
            Product existing = productRepository.findById(id).orElse(null);
            if (existing == null) {
                return Map.of("success", false, "message", "Product is not existed!!!");
            }
            if (form.containsKey("name")) existing.setName(form.get("name"));
            if (form.containsKey("price") || form.containsKey("stock") || form.containsKey("variants")) {
                existing.setVariants(buildVariants(form, existing.getSlug()));
            }
            if (form.containsKey("company")) existing.setBrand(form.get("company"));
            if (form.containsKey("brand")) existing.setBrand(form.get("brand"));
            if (form.containsKey("description")) existing.setDescription(form.get("description"));
            if (form.containsKey("category")) existing.setCategory(form.get("category"));
            if (form.containsKey("images")) {
                List<Product.ProductImage> incomingImages = parseImages(form.get("images"));
                // Keep existing cover images when update payload accidentally sends empty list
                // (e.g. admin uploads variant image and cover list is not present in request state).
                if (!incomingImages.isEmpty()) {
                    existing.setImages(incomingImages);
                }
            }
            if (form.containsKey("status") && form.get("status") != null) {
                existing.setStatus(normalizeProductStatus(form.get("status")));
            }
            productRepository.save(existing);
            return Map.of("success", true, "message", "Update successfully!");
        } catch (Exception e) {
            return Map.of("success", false, "message", "Something went wrong!", "error", e.getMessage());
        }
    }

    public Map<String, Object> deleteMulti(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return Map.of("success", false, "message", "No ids");
        }
        productRepository.deleteAllById(ids);
        return Map.of("success", true, "message", "Remove successfully!");
    }

    /**
     * Lean catalog for AI chatbot — only active products, no images.
     * Each entry: name, slug, category, brand, price, variants[color, size, stock].
     */
    public List<Map<String, Object>> getChatbotCatalog() {
        return productRepository.findAll().stream()
                .filter(p -> "active".equals(p.getStatus()))
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", p.getName());
                    m.put("slug", p.getSlug() != null ? p.getSlug() : "");
                    m.put("category", p.getCategory() != null ? p.getCategory() : "");
                    m.put("brand", p.getBrand() != null ? p.getBrand() : "");
                    m.put("price", (long) minVariantPrice(p));
                    List<Map<String, Object>> variants = new ArrayList<>();
                    if (p.getVariants() != null) {
                        for (Product.ProductVariant v : p.getVariants()) {
                            if (Boolean.FALSE.equals(v.getIsActive())) continue;
                            Map<String, Object> vm = new LinkedHashMap<>();
                            vm.put("color", v.getColor() != null ? v.getColor().getName() : "");
                            vm.put("size", v.getSize() != null ? v.getSize() : "");
                            vm.put("stock", v.getInventory() != null ? v.getInventory() : 0);
                            variants.add(vm);
                        }
                    }
                    m.put("variants", variants);
                    return m;
                })
                .toList();
    }

    /** Shape compatible with existing React (stock, images, company, price) */
    public Map<String, Object> toClientProduct(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", p.getId());
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("slug", p.getSlug());
        m.put("description", p.getDescription());
        m.put("category", p.getCategory());
        m.put("company", p.getBrand());
        m.put("brand", p.getBrand());
        m.put("gender", p.getGender());
        m.put("tags", p.getTags());
        m.put("status", p.getStatus());
        m.put("images", clientImages(p));
        m.put("stock", clientStock(p));
        m.put("variants", p.getVariants());
        Map<String, Double> pricing = listPricing(p);
        m.put("price", pricing.get("price"));
        if (pricing.get("compareAtPrice") != null) {
            m.put("compareAtPrice", pricing.get("compareAtPrice"));
        }
        m.put("createdAt", p.getCreatedAt());
        m.put("updatedAt", p.getUpdatedAt());
        return m;
    }

    private List<Map<String, Object>> clientImages(Product p) {
        List<Map<String, Object>> imgs = new ArrayList<>();
        if (p.getImages() != null) {
            for (Product.ProductImage img : p.getImages()) {
                Map<String, Object> row = new HashMap<>();
                row.put("url", img.getUrl());
                row.put("name", img.getAlt());
                row.put("uid", UUID.randomUUID().toString());
                row.put("status", "done");
                imgs.add(row);
            }
        }
        return imgs;
    }

    private List<Map<String, Object>> clientStock(Product p) {
        List<Map<String, Object>> stock = new ArrayList<>();
        if (p.getVariants() == null) return stock;
        for (Product.ProductVariant v : p.getVariants()) {
            Map<String, Object> row = new HashMap<>();
            row.put("_id", v.getId());
            row.put("color", v.getColor() != null ? v.getColor().getName() : v.getSize());
            row.put("hex", v.getColor() != null && v.getColor().getHex() != null ? v.getColor().getHex() : "#cccccc");
            row.put("amount", v.getInventory());
            row.put("price", v.getPrice());
            Double variantCompare = resolveVariantCompareAtPrice(v);
            if (variantCompare != null) {
                row.put("compareAtPrice", variantCompare);
            }
            row.put("size", v.getSize());
            row.put("sku", v.getSku());
            row.put("imageUrl", v.getImageUrl());
            stock.add(row);
        }
        return stock;
    }
}
