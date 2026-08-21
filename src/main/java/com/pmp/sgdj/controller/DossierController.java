package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.DossierCreateDTO;
import com.pmp.sgdj.dto.DossierResponseDTO;
import com.pmp.sgdj.dto.DossierUpdateDTO;
import com.pmp.sgdj.enums.StatutDossier;
import com.pmp.sgdj.service.DossierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
public class DossierController {

    private final DossierService dossierService;

    /**
     * Créer un dossier.
     *
     * ADMIN et UTILISATEUR peuvent créer.
     *
     * Le dossier sera toujours EN_COURS.
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

    /**
     * Consulter un dossier.
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

    /**
     * Consulter tous les dossiers.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("dateCreation").descending()
        );

        return ResponseEntity.ok(
                dossierService.getAll(pageable)
        );
    }

    /**
     * Rechercher un dossier.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> search(
            @RequestParam(required = false) String numeroDossier,
            @RequestParam(required = false) String objet,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("dateCreation").descending()
        );

        return ResponseEntity.ok(
                dossierService.search(
                        numeroDossier,
                        objet,
                        pageable
                )
        );
    }

    /**
     * Filtrer par statut.
     */
    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'UTILISATEUR')")
    public ResponseEntity<Page<DossierResponseDTO>> findByStatut(
            @PathVariable StatutDossier statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("dateCreation").descending()
        );

        return ResponseEntity.ok(
                dossierService.findByStatut(
                        statut,
                        pageable
                )
        );
    }

    /**
     * Modifier un dossier.
     *
     * ADMIN uniquement.
     *
     * Permet EN_COURS -> CLOTURE.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DossierResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody DossierUpdateDTO dto
    ) {

        return ResponseEntity.ok(
                dossierService.update(id, dto)
        );
    }

    /**
     * Archiver un dossier.
     *
     * ADMIN uniquement.
     *
     * CLOTURE -> ARCHIVE.
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
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );

        dossierService.delete(
                id,
                authentication.getName(),
                isAdmin
        );

        return ResponseEntity.noContent().build();
    }
}