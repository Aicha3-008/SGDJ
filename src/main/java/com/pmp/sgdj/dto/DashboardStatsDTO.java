package com.pmp.sgdj.dto;

import java.util.List;

public record DashboardStatsDTO(
        long totalUtilisateurs,
        long totalDossiers,
        long totalDossiersArchives,
        List<UtilisateurResponseDTO> derniersUtilisateurs,
        UtilisateurResponseDTO profilConnecte
) {
}
