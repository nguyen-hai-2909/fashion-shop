package com.fashion.service;

import com.fashion.document.Category;
import com.fashion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public Map<String, Object> list(boolean all) {
        List<Category> rows = all
                ? categoryRepository.findAll().stream().sorted(Comparator.comparing(c -> Optional.ofNullable(c.getSortOrder()).orElse(0))).toList()
                : categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return Map.of("success", true, "message", "Success", "data", rows);
    }

    public Map<String, Object> create(Map<String, Object> body) {
        try {
            String name = Objects.toString(body.get("name"), "").trim();
            if (name.isBlank()) return Map.of("success", false, "message", "Category name is required");
            String slug = Objects.toString(body.get("slug"), "").trim();
            if (slug.isBlank()) slug = slugify(name);
            if (categoryRepository.findBySlug(slug).isPresent()) {
                slug = slug + "-" + Integer.toHexString(new Random().nextInt(4096));
            }
            Category c = new Category();
            c.setName(name);
            c.setSlug(slug);
            c.setParentId(Objects.toString(body.get("parentId"), null));
            c.setImageUrl(Objects.toString(body.get("imageUrl"), ""));
            c.setSortOrder(parseInt(body.get("sortOrder"), 0));
            c.setIsActive(parseBool(body.get("isActive"), true));
            Category saved = categoryRepository.save(c);
            return Map.of("success", true, "message", "Create category success", "data", saved);
        } catch (Exception e) {
            return Map.of("success", false, "message", "Something went wrong!", "error", e.getMessage());
        }
    }

    public Map<String, Object> update(String id, Map<String, Object> body) {
        Category c = categoryRepository.findById(id).orElse(null);
        if (c == null) return Map.of("success", false, "message", "Not found");
        if (body.containsKey("name")) c.setName(Objects.toString(body.get("name"), c.getName()));
        if (body.containsKey("slug")) c.setSlug(Objects.toString(body.get("slug"), c.getSlug()));
        if (body.containsKey("parentId")) c.setParentId(Objects.toString(body.get("parentId"), c.getParentId()));
        if (body.containsKey("imageUrl")) c.setImageUrl(Objects.toString(body.get("imageUrl"), c.getImageUrl()));
        if (body.containsKey("sortOrder")) c.setSortOrder(parseInt(body.get("sortOrder"), Optional.ofNullable(c.getSortOrder()).orElse(0)));
        if (body.containsKey("isActive")) c.setIsActive(parseBool(body.get("isActive"), Optional.ofNullable(c.getIsActive()).orElse(true)));
        return Map.of("success", true, "message", "Update category success", "data", categoryRepository.save(c));
    }

    public Map<String, Object> toggle(String id) {
        Category c = categoryRepository.findById(id).orElse(null);
        if (c == null) return Map.of("success", false, "message", "Not found");
        c.setIsActive(!(Boolean.TRUE.equals(c.getIsActive())));
        return Map.of("success", true, "message", "Update category status success", "data", categoryRepository.save(c));
    }

    public Map<String, Object> delete(String id) {
        if (!categoryRepository.existsById(id)) return Map.of("success", false, "message", "Not found");
        categoryRepository.deleteById(id);
        return Map.of("success", true, "message", "Delete category success");
    }

    private static int parseInt(Object raw, int d) {
        if (raw == null) return d;
        if (raw instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(raw.toString().trim());
        } catch (Exception e) {
            return d;
        }
    }

    private static boolean parseBool(Object raw, boolean d) {
        if (raw == null) return d;
        if (raw instanceof Boolean b) return b;
        String s = raw.toString().trim().toLowerCase(Locale.ROOT);
        if ("true".equals(s) || "1".equals(s)) return true;
        if ("false".equals(s) || "0".equals(s)) return false;
        return d;
    }

    private static String slugify(String input) {
        if (input == null) return "cat-" + System.currentTimeMillis();
        String n = Normalizer.normalize(input, Normalizer.Form.NFD);
        n = Pattern.compile("\\p{M}").matcher(n).replaceAll("");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
