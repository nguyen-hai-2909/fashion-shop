package com.fashion.util;

import com.fashion.document.Product;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

public final class ColorDisplayUtil {

    private static final Map<String, String> HEX_LABELS = new LinkedHashMap<>();

    static {
        put("#FF0000", "Red");
        put("#00FF00", "Green");
        put("#0000FF", "Blue");
        put("#000000", "Black");
        put("#FFB900", "Yellow");
        put("#FFFFFF", "White");
        put("#9E9E9E", "Gray");
        put("#A67C52", "Brown-Beige");
        put("#E8D4B8", "Beige");
        put("#6B2D5C", "Purple");
        put("#5C4033", "Earth Brown");
        put("#4A5D4A", "Moss Green");
        put("#C27B4A", "Terracotta");
        put("#F4C2C2", "Pastel Pink");
        put("#B2F0D4", "Pastel Mint");
        put("#D4B5D4", "Pastel Lavender");
    }

    private ColorDisplayUtil() {
    }

    private static void put(String hex, String label) {
        HEX_LABELS.put(normalizeHex(hex), label);
    }

    public static String labelFromHexOrName(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String v = value.trim();
        if (v.startsWith("#")) {
            return HEX_LABELS.getOrDefault(normalizeHex(v), v);
        }
        String asHex = normalizeHex("#" + v.replace("#", ""));
        if (HEX_LABELS.containsKey(asHex)) {
            return HEX_LABELS.get(asHex);
        }
        return v;
    }

    public static String variantTitle(Product.ProductVariant variant) {
        if (variant == null) {
            return "";
        }
        String colorPart = "";
        if (variant.getColor() != null) {
            Product.ColorEmb c = variant.getColor();
            if (c.getHex() != null && !c.getHex().isBlank()) {
                colorPart = labelFromHexOrName(c.getHex());
            } else if (c.getName() != null && !c.getName().isBlank()) {
                colorPart = labelFromHexOrName(c.getName());
            }
        }
        String size = Objects.toString(variant.getSize(), "").trim();
        if (colorPart.isBlank()) {
            return size;
        }
        if (size.isBlank()) {
            return colorPart;
        }
        return colorPart + " / " + size;
    }

    public static String formatStoredVariantTitle(String variantTitle) {
        if (variantTitle == null || variantTitle.isBlank()) {
            return variantTitle;
        }
        String[] parts = variantTitle.split("\\s*/\\s*", 2);
        if (parts.length == 2) {
            return labelFromHexOrName(parts[0].trim()) + " / " + parts[1].trim();
        }
        return labelFromHexOrName(variantTitle.trim());
    }

    private static String normalizeHex(String hex) {
        if (hex == null) {
            return "";
        }
        String h = hex.trim().toUpperCase(Locale.ROOT);
        if (!h.startsWith("#")) {
            h = "#" + h;
        }
        return h;
    }
}
