package com.fashion.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final MailService mailService;

    @Value("${spring.mail.username:}")
    private String notifyEmail;

    public Map<String, Object> submit(Map<String, String> body) {
        String name = Objects.toString(body.get("name"), "").trim();
        String email = Objects.toString(body.get("email"), "").trim();
        String message = Objects.toString(body.get("message"), "").trim();

        if (name.isBlank()) {
            return Map.of("success", false, "message", "Name is required");
        }
        if (email.isBlank() || !email.contains("@")) {
            return Map.of("success", false, "message", "Valid email is required");
        }
        if (message.isBlank()) {
            return Map.of("success", false, "message", "Message is required");
        }

        String to = notifyEmail != null && !notifyEmail.isBlank() ? notifyEmail : email;
        String adminBody = "Contact form submission\n\n"
                + "Name: " + name + "\n"
                + "Email: " + email + "\n\n"
                + message;
        mailService.send(to, "Website contact: " + name, adminBody);
        mailService.send(
                email,
                "We received your message",
                "Hi " + name + ",\n\nThank you for contacting us. We will reply as soon as possible.\n\n— ComfySloth"
        );

        return Map.of("success", true, "message", "Message sent successfully");
    }
}
