package com.pmp.sgdj.service;

import com.pmp.sgdj.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Map<String, String> ALLOWED_PHOTO_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private static final Map<String, String> ALLOWED_DOCUMENT_TYPES = Map.of(
            "application/pdf", ".pdf",
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "application/msword", ".doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"
    );

    @Value("${app.upload.photos-dir}")
    private String photosDir;

    @Value("${app.upload.documents-dir}")
    private String documentsDir;

    public String storeProfilePhoto(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier fourni");
        }

        String extension = ALLOWED_PHOTO_TYPES.get(file.getContentType());

        if (extension == null) {
            throw new IllegalArgumentException(
                    "Format d'image non autorise (jpeg, png ou webp uniquement)"
            );
        }

        return store(file, extension, photosDir);
    }

    public void deleteProfilePhoto(String filename) {
        delete(filename, photosDir);
    }

    public String storeDocument(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier fourni");
        }

        String extension = ALLOWED_DOCUMENT_TYPES.get(file.getContentType());

        if (extension == null) {
            throw new IllegalArgumentException(
                    "Type de fichier non autorise (pdf, image jpeg/png, ou document Word uniquement)"
            );
        }

        return store(file, extension, documentsDir);
    }

    public void deleteDocument(String filename) {
        delete(filename, documentsDir);
    }

    public Resource loadDocumentAsResource(String filename) {

        try {
            Path targetDir =
                    Path.of(documentsDir).toAbsolutePath().normalize();

            Path targetFile =
                    targetDir.resolve(filename).normalize();

            if (!targetFile.getParent().equals(targetDir)) {
                throw new IllegalArgumentException(
                        "Chemin de fichier invalide"
                );
            }

            Resource resource =
                    new UrlResource(targetFile.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException(
                        "Fichier introuvable sur le serveur"
                );
            }

            return resource;

        } catch (MalformedURLException e) {
            throw new UncheckedIOException(
                    "Chemin de fichier invalide",
                    new IOException(e)
            );
        }
    }

    private String store(
            MultipartFile file,
            String extension,
            String targetDirPath
    ) {

        try {
            Path targetDir =
                    Path.of(targetDirPath)
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(targetDir);

            String filename =
                    UUID.randomUUID() + extension;

            Path targetFile =
                    targetDir.resolve(filename).normalize();

            if (!targetFile.getParent().equals(targetDir)) {
                throw new IllegalArgumentException(
                        "Chemin de fichier invalide"
                );
            }

            try (InputStream in = file.getInputStream()) {

                Files.copy(
                        in,
                        targetFile,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            return filename;

        } catch (IOException e) {

            throw new UncheckedIOException(
                    "Echec de l'enregistrement du fichier",
                    e
            );
        }
    }

    private void delete(
            String filename,
            String targetDirPath
    ) {

        if (filename == null || filename.isBlank()) {
            return;
        }

        try {
            Path targetDir =
                    Path.of(targetDirPath)
                            .toAbsolutePath()
                            .normalize();

            Path targetFile =
                    targetDir.resolve(filename)
                            .normalize();

            if (targetFile.getParent().equals(targetDir)) {
                Files.deleteIfExists(targetFile);
            }

        } catch (IOException ignored) {
            // Suppression best-effort.
        }
    }
}