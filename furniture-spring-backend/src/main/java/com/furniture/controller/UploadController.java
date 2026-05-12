package com.furniture.controller;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {

    private static final List<String> ALLOWED_EXT = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp");

    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No file uploaded"
            ));
        }
        try {
            String original = Objects.toString(file.getOriginalFilename(), "image");
            original = original.replaceAll("[\\\\/]", "_");
            String ext = extension(original).replace(".", "");

            // Prefer Cloudinary when configured; fallback to local disk if missing/failed.
            if (StringUtils.hasText(cloudinaryUrl)) {
                try {
                    Cloudinary cloudinary = new Cloudinary(cloudinaryUrl);
                    Map<?, ?> uploaded = cloudinary.uploader().upload(
                            file.getBytes(),
                            Map.of(
                                    "folder", "fashion/products",
                                    "resource_type", "image",
                                    "public_id", "img-" + UUID.randomUUID(),
                                    "use_filename", true,
                                    "unique_filename", true,
                                    "format", ext
                            )
                    );

                    String secureUrl = Objects.toString(uploaded.get("secure_url"), "");
                    String uid = Objects.toString(uploaded.get("asset_id"), UUID.randomUUID().toString());
                    if (StringUtils.hasText(secureUrl)) {
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "url", secureUrl,
                                "original_filename", original,
                                "asset_id", uid,
                                "storage", "cloudinary"
                        ));
                    }
                } catch (Exception ignored) {
                    // Fall through to local upload
                }
            }

            return uploadLocal(file, original, ext);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Upload failed: " + e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> uploadLocal(MultipartFile file, String original, String extWithoutDot) {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String ext = StringUtils.hasText(extWithoutDot) ? "." + extWithoutDot : "";
            String storedName = UUID.randomUUID() + ext;
            Path target = dir.resolve(storedName).normalize();
            if (!target.startsWith(dir)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid path"));
            }

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "url", "/photos/" + storedName,
                    "original_filename", original,
                    "asset_id", UUID.randomUUID().toString(),
                    "storage", "local"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Local upload failed: " + e.getMessage()
            ));
        }
    }

    private static String extension(String originalFilename) {
        int dot = originalFilename.lastIndexOf('.');
        if (dot < 0) {
            return "jpg";
        }
        String e = originalFilename.substring(dot).toLowerCase();
        return ALLOWED_EXT.contains(e) ? e : "jpg";
    }
}
