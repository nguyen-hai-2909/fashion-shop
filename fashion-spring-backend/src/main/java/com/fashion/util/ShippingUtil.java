package com.fashion.util;

public final class ShippingUtil {

    /** Orders above this subtotal qualify for free shipping. */
    public static final double FREE_SHIPPING_THRESHOLD = 1_999_000;
    public static final double STANDARD_SHIPPING_FEE = 50_000;

    private ShippingUtil() {
    }

    public static double calculateShippingFee(double subtotal) {
        return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    }
}
