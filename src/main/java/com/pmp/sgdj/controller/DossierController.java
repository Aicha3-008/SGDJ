package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.DossierCreateDTO;
import com.pmp.sgdj.dto.DossierResponseDTO;
import com.pmp.sgdj.dto.DossierUpdateDTO;
import com.pmp.sgdj.enums.StatutDossier;
import com.pmp.sgdj.service.DossierPdfService;
import com.pmp.sgdj.service.DossierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
public class DossierController {

    private final DossierService dossierService;

    private final DossierPdfService dossierPdfService;


    // ======================================================
    // CREER UN DOSSIER
    // ======================================================

    /**
     * Créer un dossier.
     *
     * ADMIN et UTILISATEUR peuvent créer.
     *
     * Le dossier commence toujours en EN_COURS.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<DossierResponseDTO> create(
            @Valid @RequestBody DossierCreateDTO dto,
            Authentication authentication
    ) {

        DossierResponseDTO dossier =
                dossierService.create(
                        dto,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dossier);
    }


    // ======================================================
    // CONSULTER UN DOSSIER
    // ======================================================

    /**
     * Consulter un dossier.
     *
     * ADMIN et UTILISATEUR peuvent consulter.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<DossierResponseDTO> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                dossierService.getById(id)
        );
    }


    // ======================================================
    // TELECHARGER LE PDF
    // ======================================================

    /**
     * Télécharger le PDF d'un dossier.
     *
     * ADMIN :
     * peut télécharger n'importe quel dossier.
     *
     * UTILISATEUR :
     * peut télécharger uniquement ses propres dossiers.
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long id,
            Authentication authentication
    ) {

        byte[] pdf =
                dossierPdfService.generatePdf(
                        id,
                        authentication
                );


        String filename =
                "dossier-" + id + ".pdf";


        return ResponseEntity.ok()

                .contentType(
                        MediaType.APPLICATION_PDF
                )

                .header(
                        "Content-Disposition",
                        "attachment; filename=\"" +
                                filename +
                                "\""
                )

                .body(pdf);
    }


    // ======================================================
    // CONSULTER TOUS LES DOSSIERS
    // ======================================================

    /**
     * Consulter tous les dossiers.
     *
     * ADMIN et UTILISATEUR peuvent consulter.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("dateCreation")
                                .descending()
                );

        return ResponseEntity.ok(
                dossierService.getAll(pageable)
        );
    }


    // ======================================================
    // RECHERCHER UN DOSSIER
    // ======================================================

    /**
     * Rechercher par numéro ou objet.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> search(
            @RequestParam(required = false)
            String numeroDossier,

            @RequestParam(required = false)
            String objet,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("dateCreation")
                                .descending()
                );

        return ResponseEntity.ok(
                dossierService.search(
                        numeroDossier,
                        objet,
                        pageable
                )
        );
    }


    // ======================================================
    // FILTRER PAR STATUT
    // ======================================================

    /**
     * Filtrer les dossiers par statut.
     */
    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> findByStatut(
            @PathVariable StatutDossier statut,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("dateCreation")
                                .descending()
                );

        return ResponseEntity.ok(
                dossierService.findByStatut(
                        statut,
                        pageable
                )
        );
    }


    // ======================================================
    // MODIFIER UN DOSSIER
    // ======================================================

    /**
     * Modifier un dossier.
     *
     * ADMIN uniquement.
     *
     * Permet notamment :
     *
     * EN_COURS -> CLOTURE
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DossierResponseDTO> update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            DossierUpdateDTO dto
    ) {

        return ResponseEntity.ok(
                dossierService.update(
                        id,
                        dto
                )
        );
    }


    // ======================================================
    // ARCHIVER UN DOSSIER
    // ======================================================

    /**
     * Archiver un dossier.
     *
     * ADMIN uniquement.
     *
     * Transition :
     *
     * CLOTURE -> ARCHIVE
     */
    @PostMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DossierResponseDTO> archive(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                dossierService.archive(id)
        );
    }


    // ======================================================
    // SUPPRIMER UN DOSSIER
    // ======================================================

    /**
     * Supprimer un dossier.
     *
     * ADMIN :
     * peut supprimer n'importe quel dossier.
     *
     * UTILISATEUR :
     * peut supprimer uniquement ses propres dossiers.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {

        boolean isAdmin =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals("ROLE_ADMIN")
                        );


        dossierService.delete(
                id,
                authentication.getName(),
                isAdmin
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}