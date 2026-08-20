package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.enums.StatutDossier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DossierJudiciaireRepository extends JpaRepository<DossierJudiciaire, Long> {

    long countByStatut(StatutDossier statut);

    long countByUtilisateurId(Long utilisateurId);

    long countByUtilisateurIdAndStatut(Long utilisateurId, StatutDossier statut);

    List<DossierJudiciaire> findTop5ByOrderByDateCreationDesc();

    List<DossierJudiciaire> findTop5ByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);

    List<DossierJudiciaire> findTop5ByDateMajIsNotNullOrderByDateMajDesc();

    List<DossierJudiciaire> findTop5ByUtilisateurIdAndDateMajIsNotNullOrderByDateMajDesc(Long utilisateurId);
}
