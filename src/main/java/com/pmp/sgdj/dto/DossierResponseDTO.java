package com.pmp.sgdj.dto;

import com.pmp.sgdj.enums.StatutDossier;

import java.time.LocalDateTime;

public record DossierResponseDTO(

        Long id,

        String numeroDossier,

        String objet,

        String description,

        String tribunal,

        String juge,

        String procureur,

        StatutDossier statut,

        LocalDateTime dateCreation,

        LocalDateTime dateMaj,


        Long utilisateurId

) {
}