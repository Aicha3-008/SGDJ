package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.DashboardStatsDTO;
import com.pmp.sgdj.dto.DossierSummaryDTO;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.enums.StatutDossier;
import com.pmp.sgdj.mapper.UtilisateurMapper;
import com.pmp.sgdj.repository.DossierJudiciaireRepository;
import com.pmp.sgdj.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final DossierJudiciaireRepository dossierJudiciaireRepository;
    private final UtilisateurMapper utilisateurMapper;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats(Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        Utilisateur utilisateur = utilisateurRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        Long userId = utilisateur.getId();

        /*
         * Un ADMIN voit les statistiques globales.
         * Un UTILISATEUR ne voit que les dossiers qu'il a créés.
         */

        long totalDossiers = isAdmin
                ? dossierJudiciaireRepository.count()
                : dossierJudiciaireRepository.countByUtilisateurId(userId);

        long totalDossiersArchives = isAdmin
                ? dossierJudiciaireRepository.countByStatut(StatutDossier.ARCHIVE)
                : dossierJudiciaireRepository.countByUtilisateurIdAndStatut(
                userId,
                StatutDossier.ARCHIVE
        );

        /*
         * Les 5 dossiers les plus récents.
         */
        List<DossierJudiciaire> dossiersRecents = isAdmin
                ? dossierJudiciaireRepository
                .findTop5ByOrderByDateCreationDesc()
                : dossierJudiciaireRepository
                .findTop5ByUtilisateurIdOrderByDateCreationDesc(userId);

        /*
         * Les 5 dernières modifications.
         */
        List<DossierJudiciaire> dernieresModifications = isAdmin
                ? dossierJudiciaireRepository
                .findTop5ByDateMajIsNotNullOrderByDateMajDesc()
                : dossierJudiciaireRepository
                .findTop5ByUtilisateurIdAndDateMajIsNotNullOrderByDateMajDesc(userId);

        /*
         * Les 5 derniers utilisateurs créés.
         * Cette information est uniquement visible par l'administrateur.
         */
        List<UtilisateurResponseDTO> derniersUtilisateurs = isAdmin
                ? utilisateurRepository
                .findTop5ByOrderByDateCreationDesc()
                .stream()
                .map(utilisateurMapper::toResponseDTO)
                .toList()
                : List.of();

        /*
         * Construction du DashboardStatsDTO.
         *
         * Le record DashboardStatsDTO attend exactement 7 paramètres :
         *
         * 1. totalUtilisateurs
         * 2. totalDossiers
         * 3. totalDossiersArchives
         * 4. dossiersRecents
         * 5. dernieresModifications
         * 6. derniersUtilisateurs
         * 7. profilConnecte
         */
        return new DashboardStatsDTO(
                utilisateurRepository.count(),
                totalDossiers,
                totalDossiersArchives,

                dossiersRecents
                        .stream()
                        .map(this::toSummary)
                        .toList(),

                dernieresModifications
                        .stream()
                        .map(this::toSummary)
                        .toList(),

                derniersUtilisateurs,

                utilisateurMapper.toResponseDTO(utilisateur)
        );
    }

    /**
     * Transforme un dossier judiciaire en DossierSummaryDTO
     * pour l'affichage dans le dashboard.
     */
    private DossierSummaryDTO toSummary(DossierJudiciaire dossier) {

        String creePar = dossier.getUtilisateur() != null
                ? dossier.getUtilisateur().getPrenom()
                + " "
                + dossier.getUtilisateur().getNom()
                : null;

        return new DossierSummaryDTO(
                dossier.getId(),
                dossier.getNumeroDossier(),
                dossier.getObjet(),
                dossier.getStatut(),
                dossier.getDateCreation(),
                dossier.getDateMaj(),
                creePar
        );
    }
}