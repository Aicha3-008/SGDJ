package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.UtilisateurCreateDTO;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.dto.UtilisateurUpdateDTO;
import com.pmp.sgdj.enums.Role;
import com.pmp.sgdj.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/** Toutes les operations de ce controller sont reservees a l'administrateur (RBAC). */
@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public ResponseEntity<Page<UtilisateurResponseDTO>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean actif,
            @PageableDefault(size = 10, sort = "dateCreation") Pageable pageable) {
        return ResponseEntity.ok(utilisateurService.search(query, role, actif, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UtilisateurResponseDTO> create(@Valid @RequestBody UtilisateurCreateDTO dto) {
        return ResponseEntity.status(201).body(utilisateurService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurResponseDTO> update(@PathVariable Long id,
                                                           @Valid @RequestBody UtilisateurUpdateDTO dto) {
        return ResponseEntity.ok(utilisateurService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        ensureNotSelf(id, authentication);
        utilisateurService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desactiver")
    public ResponseEntity<UtilisateurResponseDTO> desactiver(@PathVariable Long id, Authentication authentication) {
        ensureNotSelf(id, authentication);
        return ResponseEntity.ok(utilisateurService.desactiver(id));
    }

    @PatchMapping("/{id}/reactiver")
    public ResponseEntity<UtilisateurResponseDTO> reactiver(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.reactiver(id));
    }

    @PatchMapping("/{id}/deverrouiller")
    public ResponseEntity<UtilisateurResponseDTO> deverrouiller(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.deverrouiller(id));
    }

    private void ensureNotSelf(Long id, Authentication authentication) {
        UtilisateurResponseDTO target = utilisateurService.getById(id);
        if (target.email().equalsIgnoreCase(authentication.getName())) {
            throw new IllegalArgumentException("Vous ne pouvez pas effectuer cette action sur votre propre compte");
        }
    }
}
