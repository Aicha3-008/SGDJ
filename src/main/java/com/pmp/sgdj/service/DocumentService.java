package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.DocumentResponseDTO;
import com.pmp.sgdj.entity.Document;
import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.exception.ResourceNotFoundException;
import com.pmp.sgdj.repository.DocumentRepository;
import com.pmp.sgdj.repository.DossierJudiciaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DossierJudiciaireRepository dossierJudiciaireRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.upload.max-document-size}")
    private long maxDocumentSize;

    /**
     * Rattacher un nouveau document a un dossier judiciaire.
     *
     * ADMIN et USER autorises par le controller.
     */
    @Transactional
    public DocumentResponseDTO upload(
            Long dossierId,
            MultipartFile file
    ) {

        // ==========================================
        // VERIFICATION DU FICHIER
        // ==========================================

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun fichier fourni"
            );
        }

        // Taille maximale
        if (file.getSize() > maxDocumentSize) {
            throw new IllegalArgumentException(
                    "Le fichier depasse la taille maximale autorisee ("
                            + (maxDocumentSize / (1024 * 1024))
                            + " Mo)"
            );
        }

        // ==========================================
        // VERIFICATION DU DOSSIER
        // ==========================================

        DossierJudiciaire dossier =
                dossierJudiciaireRepository
                        .findById(dossierId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Dossier introuvable"
                                )
                        );

        // ==========================================
        // VERIFICATION DU FORMAT
        // ==========================================

        String originalFilename =
                file.getOriginalFilename();

        if (!isAllowedFile(originalFilename)) {
            throw new IllegalArgumentException(
                    "Format de fichier non autorise. "
                            + "Formats acceptes : PDF, JPG, JPEG, PNG, DOC et DOCX."
            );
        }

        // ==========================================
        // STOCKAGE DU FICHIER
        // ==========================================

        String storedFilename =
                fileStorageService.storeDocument(file);

        // ==========================================
        // CREATION DE L'ENTITE DOCUMENT
        // ==========================================

        Document document = Document.builder()
                .nomFichier(
                        sanitizeOriginalName(
                                originalFilename
                        )
                )
                .typeFichier(
                        file.getContentType()
                )
                .cheminFichier(
                        storedFilename
                )
                .taille(
                        file.getSize()
                )
                .dateAjout(
                        LocalDateTime.now()
                )
                .dossier(
                        dossier
                )
                .build();

        return toResponseDTO(
                documentRepository.save(document)
        );
    }

    /**
     * Lister les documents rattaches a un dossier.
     */
    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> listByDossier(
            Long dossierId
    ) {

        if (!dossierJudiciaireRepository.existsById(dossierId)) {
            throw new ResourceNotFoundException(
                    "Dossier introuvable"
            );
        }

        return documentRepository
                .findByDossierIdOrderByDateAjoutDesc(
                        dossierId
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    /**
     * Preparer le telechargement d'un document.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> download(
            Long id
    ) {

        Document document =
                documentRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Document introuvable"
                                )
                        );

        Resource resource =
                fileStorageService.loadDocumentAsResource(
                        document.getCheminFichier()
                );

        MediaType contentType;

        try {
            contentType =
                    document.getTypeFichier() != null
                            ? MediaType.parseMediaType(
                            document.getTypeFichier()
                    )
                            : MediaType.APPLICATION_OCTET_STREAM;

        } catch (Exception e) {

            contentType =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                document.getNomFichier(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(contentType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .body(resource);
    }

    /**
     * Supprimer un document.
     */
    @Transactional
    public void delete(Long id) {

        Document document =
                documentRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Document introuvable"
                                )
                        );

        /*
         * Suppression du fichier physique.
         */
        fileStorageService.deleteDocument(
                document.getCheminFichier()
        );

        /*
         * Suppression de l'enregistrement en base.
         */
        documentRepository.delete(document);
    }

    /**
     * Vérifier l'extension du fichier.
     */
    private boolean isAllowedFile(
            String originalFilename
    ) {

        if (originalFilename == null
                || originalFilename.isBlank()) {

            return false;
        }

        String filename =
                originalFilename.toLowerCase();

        return filename.endsWith(".pdf")
                || filename.endsWith(".jpg")
                || filename.endsWith(".jpeg")
                || filename.endsWith(".png")
                || filename.endsWith(".doc")
                || filename.endsWith(".docx");
    }

    /**
     * Nettoyer le nom original du fichier.
     *
     * Le nom original est uniquement utilise
     * pour l'affichage.
     *
     * Le fichier physique est stocke avec
     * un nom genere par FileStorageService.
     */
    private String sanitizeOriginalName(
            String originalName
    ) {

        if (originalName == null
                || originalName.isBlank()) {

            return "document";
        }

        String baseName =
                originalName.replace(
                        "\\",
                        "/"
                );

        baseName =
                baseName.substring(
                        baseName.lastIndexOf('/') + 1
                );

        return baseName.length() > 255
                ? baseName.substring(0, 255)
                : baseName;
    }

    /**
     * Conversion Entity -> DTO.
     */
    private DocumentResponseDTO toResponseDTO(
            Document document
    ) {

        return new DocumentResponseDTO(
                document.getId(),
                document.getNomFichier(),
                document.getTypeFichier(),
                document.getTaille(),
                document.getDateAjout(),
                document.getDossier() != null
                        ? document.getDossier().getId()
                        : null
        );
    }
}