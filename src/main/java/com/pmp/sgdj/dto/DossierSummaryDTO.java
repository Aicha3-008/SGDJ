package com.pmp.sgdj.dto;

import com.pmp.sgdj.enums.StatutDossier;

import java.time.LocalDateTime;

/** Projection allegee d'un dossier judiciaire pour l'affichage dans le tableau de bord. */
public record DossierSummaryDTO(
        Long id,
        String numeroDossier,
        String objet,
        StatutDossier statut,
        LocalDateTime dateCreation,
        LocalDateTime dateMaj,
        String creePar
) {
}
