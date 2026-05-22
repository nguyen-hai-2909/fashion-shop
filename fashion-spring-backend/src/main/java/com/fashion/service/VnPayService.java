package com.fashion.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayService {

    @Value("${vnpay.tmn-code:}")
    private String tmnCode;
    @Value("${vnpay.hash-secret:}")
    private String hashSecret;
    @Value("${vnpay.pay-url:}")
    private String payUrl;
    @Value("${vnpay.return-url:}")
    private String returnUrl;

    public Map<String, Object> createPaymentUrl(HttpServletRequest req, Map<String, String> body) {
        if (hashSecret == null || hashSecret.isBlank()) {
            return Map.of("statusCode", 500, "msg", "VNPay not configured", "url", "");
        }
        String ip = Optional.ofNullable(req.getHeader("X-Forwarded-For")).orElse(req.getRemoteAddr());
        String createDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String orderId = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        long amount = Long.parseLong(body.getOrDefault("amount", "0"));
        String orderInfo = body.getOrDefault("orderDescription", "");
        String orderType = body.getOrDefault("orderType", "other");
        String locale = body.getOrDefault("language", "vn");
        if (locale.isBlank()) {
            locale = "vn";
        }
        String bankCode = body.get("bankCode");

        Map<String, String> vnp = new LinkedHashMap<>();
        vnp.put("vnp_Version", "2.1.0");
        vnp.put("vnp_Command", "pay");
        vnp.put("vnp_TmnCode", tmnCode);
        vnp.put("vnp_Locale", locale);
        vnp.put("vnp_CurrCode", "VND");
        vnp.put("vnp_TxnRef", orderId);
        vnp.put("vnp_OrderInfo", orderInfo);
        vnp.put("vnp_OrderType", orderType);
        vnp.put("vnp_Amount", String.valueOf(amount * 100));
        vnp.put("vnp_ReturnUrl", returnUrl);
        vnp.put("vnp_IpAddr", ip);
        vnp.put("vnp_CreateDate", createDate);
        if (bankCode != null && !bankCode.isBlank()) {
            vnp.put("vnp_BankCode", bankCode);
        }

        Map<String, String> sorted = sortAndEncode(vnp);
        String signData = toQueryString(sorted);
        String signed = hmacSha512(hashSecret, signData);
        sorted.put("vnp_SecureHash", signed);
        String url = payUrl + "?" + toQueryString(sorted);
        return Map.of("statusCode", 200, "msg", "Success!", "url", url);
    }

    public Map<String, Object> ipn(Map<String, String> params) {
        if (hashSecret == null || hashSecret.isBlank()) {
            return Map.of("RspCode", "97", "Message", "Not configured");
        }
        String secureHash = params.get("vnp_SecureHash");
        Map<String, String> copy = new HashMap<>(params);
        copy.remove("vnp_SecureHash");
        copy.remove("vnp_SecureHashType");
        Map<String, String> sorted = sortAndEncode(copy);
        String signData = toQueryString(sorted);
        String signed = hmacSha512(hashSecret, signData);
        if (secureHash != null && secureHash.equals(signed)) {
            return Map.of("RspCode", "00", "Message", "success");
        }
        return Map.of("RspCode", "97", "Message", "Fail checksum");
    }

    private static Map<String, String> sortAndEncode(Map<String, String> input) {
        List<String> keys = new ArrayList<>(input.keySet());
        Collections.sort(keys);
        Map<String, String> out = new LinkedHashMap<>();
        for (String key : keys) {
            String encKey = URLEncoder.encode(key, StandardCharsets.UTF_8);
            String val = input.get(key);
            String encVal = URLEncoder.encode(val == null ? "" : val, StandardCharsets.UTF_8).replace("+", "%20");
            out.put(encKey, encVal.replace("%20", "+"));
        }
        return out;
    }

    private static String toQueryString(Map<String, String> sorted) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : sorted.entrySet()) {
            if (!sb.isEmpty()) {
                sb.append("&");
            }
            sb.append(e.getKey()).append("=").append(e.getValue());
        }
        return sb.toString();
    }

    private static String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
