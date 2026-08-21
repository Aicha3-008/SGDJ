package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.DocumentResponseDTO;
import com.pmp.sgdj.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Ajouter un document à un dossier judiciaire.
     *
     * ADMIN et UTILISATEUR peuvent ajouter une pièce jointe.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    @PostMapping(
            value = "/dossier/{dossierId}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<DocumentResponseDTO> upload(
            @PathVariable Long dossierId,
            @RequestParam("file") MultipartFile file
    ) {
        DocumentResponseDTO dto =
                documentService.upload(dossierId, file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dto);
    }

    /**
     * Lister les documents d'un dossier.
     *
     * ADMIN et UTILISATEUR peuvent consulter les pièces jointes.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    @GetMapping("/dossier/{dossierId}")
    public ResponseEntity<List<DocumentResponseDTO>> listByDossier(
            @PathVariable Long dossierId
    ) {
        return ResponseEntity.ok(
                documentService.listByDossier(dossierId)
        );
    }

    /**
     * Télécharger un document.
     *
     * ADMIN et UTILISATEUR peuvent télécharger les pièces jointes.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long id
    ) {
        return documentService.download(id);
    }

    /**
     * Supprimer un document.
     *
     * ADMIN et UTILISATEUR peuvent supprimer une pièce jointe.
     *
     * Le contrôle métier pourra ensuite être renforcé
     * pour vérifier que l'utilisateur est autorisé
     * à agir sur le dossier concerné.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        documentService.delete(id);

        return ResponseEntity.noContent().build();
    }
}