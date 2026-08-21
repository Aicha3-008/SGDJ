package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.enums.StatutDossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DossierJudiciaireRepository
        extends JpaRepository<DossierJudiciaire, Long> {

    // =========================================================
    // STATISTIQUES DASHBOARD
    // =========================================================

    long countByStatut(StatutDossier statut);

    long countByUtilisateurId(Long utilisateurId);

    long countByUtilisateurIdAndStatut(
            Long utilisateurId,
            StatutDossier statut
    );

    List<DossierJudiciaire> findTop5ByOrderByDateCreationDesc();

    List<DossierJudiciaire> findTop5ByUtilisateurIdOrderByDateCreationDesc(
            Long utilisateurId
    );

    List<DossierJudiciaire> findTop5ByDateMajIsNotNullOrderByDateMajDesc();

    List<DossierJudiciaire> findTop5ByUtilisateurIdAndDateMajIsNotNullOrderByDateMajDesc(
            Long utilisateurId
    );

    // =========================================================
    // GESTION DES DOSSIERS
    // =========================================================

    boolean existsByNumeroDossier(String numeroDossier);

    Optional<DossierJudiciaire> findByNumeroDossier(
            String numeroDossier
    );

    // =========================================================
    // RECHERCHE DES DOSSIERS
    // =========================================================

    Page<DossierJudiciaire>
    findByNumeroDossierContainingIgnoreCaseOrObjetContainingIgnoreCase(
            String numeroDossier,
            String objet,
            Pageable pageable
    );

    // =========================================================
    // FILTRE PAR STATUT
    // =========================================================

    Page<DossierJudiciaire> findByStatut(
            StatutDossier statut,
            Pageable pageable
    );

    // =========================================================
    // RECHERCHE PAR NUMERO + STATUT
    // =========================================================

    Page<DossierJudiciaire>
    findByNumeroDossierContainingIgnoreCaseAndStatut(
            String numeroDossier,
            StatutDossier statut,
            Pageable pageable
    );

    // =========================================================
    // RECHERCHE PAR OBJET + STATUT
    // =========================================================

    Page<DossierJudiciaire>
    findByObjetContainingIgnoreCaseAndStatut(
            String objet,
            StatutDossier statut,
            Pageable pageable
    );
}