package com.furniture.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<PathRule> PUBLIC = List.of(
            new PathRule("GET", "/api/v1/products"),
            new PathRule("GET", "/api/v1/products/*"),
            new PathRule("GET", "/api/v1/categories"),
            new PathRule("POST", "/api/v1/users"),
            new PathRule("POST", "/api/v1/users/login"),
            new PathRule("POST", "/api/v1/users/send-mail"),
            new PathRule("PUT", "/api/v1/users/reset-password"),
            new PathRule("POST", "/api/v1/admin"),
            new PathRule("POST", "/api/v1/admin/login"),
            new PathRule("GET", "/api/v1/discount/code/*"),
            new PathRule("POST", "/api/v1/discount/code"),
            new PathRule("POST", "/api/v1/discount/email"),
            new PathRule("GET", "/api/v1/vnPay/create_payment_url"),
            new PathRule("POST", "/api/v1/vnPay/create_payment_url"),
            new PathRule("GET", "/api/v1/vnPay/vnpay_return"),
            new PathRule("GET", "/api/v1/vnPay/vnpay_ipn")
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        if (!uri.startsWith("/api/v1")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (isPublic(method, uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            writeJsonError(response, 404, "Session has expired!");
            return;
        }

        String token = header.substring(7);
        try {
            var claims = jwtService.parse(token);
            String id = JwtService.normalizeId(claims.get("id"));
            String email = claims.get("email", String.class);
            if (email != null) {
                email = email.trim();
            }
            Map<String, String> details = new HashMap<>();
            if (id != null && !id.isBlank()) {
                details.put("id", id);
            }
            if (email != null && !email.isBlank()) {
                details.put("email", email);
            }
            String principal = (id != null && !id.isBlank()) ? id : email;
            var auth = new UsernamePasswordAuthenticationToken(principal, null, List.of());
            auth.setDetails(details);
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            writeJsonError(response, 404, e.getMessage());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private boolean isPublic(String method, String uri) {
        for (PathRule rule : PUBLIC) {
            if (!rule.method.equalsIgnoreCase(method)) {
                continue;
            }
            if (MATCHER.match(rule.pattern, uri)) {
                return true;
            }
        }
        return false;
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = new HashMap<>();
        body.put("statusCode", status);
        body.put("success", false);
        body.put("message", message);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private record PathRule(String method, String pattern) {
    }
}
