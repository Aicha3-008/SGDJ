package com.pmp.sgdj.dto;

import java.time.LocalDateTime;

public record DocumentResponseDTO(
        Long id,
        String nomFichier,
        String typeFichier,
        Long taille,
        LocalDateTime dateAjout,
        Long dossierId
) {
}
