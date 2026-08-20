package com.pmp.sgdj.dto;

import java.util.List;

/**
 * Statistiques du tableau de bord. totalDossiers/totalDossiersArchives/dossiersRecents/
 * dernieresModifications sont personnalises selon le role : un ADMIN voit l'ensemble des
 * dossiers du systeme, un UTILISATEUR ne voit que les dossiers qu'il a lui-meme crees.
 */
public record DashboardStatsDTO(
        long totalUtilisateurs,
        long totalDossiers,
        long totalDossiersArchives,
        List<DossierSummaryDTO> dossiersRecents,
        List<DossierSummaryDTO> dernieresModifications,
        List<UtilisateurResponseDTO> derniersUtilisateurs,
        UtilisateurResponseDTO profilConnecte
) {
}
