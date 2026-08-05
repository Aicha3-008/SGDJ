package com.pmp.sgdj.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Stockage des photos de profil sur le disque local (serveur de fichiers).
 * Le nom de fichier original n'est jamais reutilise tel quel : un nom genere
 * (UUID + extension whitelistee) previent toute injection de chemin (path traversal)
 * et toute execution de contenu deguise (double extension, etc.).
 */
@Service
public class FileStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    @Value("${app.upload.photos-dir}")
    private String photosDir;

    public String storeProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier fourni");
        }

        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("Format d'image non autorise (jpeg, png ou webp uniquement)");
        }

        try {
            Path targetDir = Path.of(photosDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String filename = UUID.randomUUID() + extension;
            Path targetFile = targetDir.resolve(filename).normalize();

            if (!targetFile.getParent().equals(targetDir)) {
                throw new IllegalArgumentException("Chemin de fichier invalide");
            }

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return filename;
        } catch (IOException e) {
            throw new UncheckedIOException("Echec de l'enregistrement du fichier", e);
        }
    }

    public void deleteProfilePhoto(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        try {
            Path targetDir = Path.of(photosDir).toAbsolutePath().normalize();
            Path targetFile = targetDir.resolve(filename).normalize();
            if (targetFile.getParent().equals(targetDir)) {
                Files.deleteIfExists(targetFile);
            }
        } catch (IOException ignored) {
            // Suppression best-effort : ne doit jamais faire echouer l'operation appelante.
        }
    }
}
