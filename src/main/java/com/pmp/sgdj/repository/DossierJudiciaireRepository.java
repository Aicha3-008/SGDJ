package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.enums.StatutDossier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DossierJudiciaireRepository extends JpaRepository<DossierJudiciaire, Long> {

    long countByStatut(StatutDossier statut);
}
