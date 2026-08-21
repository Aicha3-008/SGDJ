package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.DossierCreateDTO;
import com.pmp.sgdj.dto.DossierResponseDTO;
import com.pmp.sgdj.dto.DossierUpdateDTO;
import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.enums.StatutDossier;
import com.pmp.sgdj.repository.DossierJudiciaireRepository;
import com.pmp.sgdj.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DossierService {

    private final DossierJudiciaireRepository dossierJudiciaireRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Création d'un dossier.
     * Tout nouveau dossier commence obligatoirement en EN_COURS.
     */
    @Transactional
    public DossierResponseDTO create(
            DossierCreateDTO dto,
            String emailUtilisateur
    ) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Les données du dossier sont obligatoires"
            );
        }

        if (dto.numeroDossier() == null
                || dto.numeroDossier().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Le numéro de dossier est obligatoire"
            );
        }

        if (dto.objet() == null
                || dto.objet().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "L'objet du dossier est obligatoire"
            );
        }

        if (dossierJudiciaireRepository
                .existsByNumeroDossier(dto.numeroDossier())) {

            throw new IllegalArgumentException(
                    "Un dossier avec ce numéro existe déjà"
            );
        }

        Utilisateur utilisateur = utilisateurRepository
                .findByEmail(emailUtilisateur)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Utilisateur introuvable"
                        )
                );

        DossierJudiciaire dossier = DossierJudiciaire.builder()
                .numeroDossier(dto.numeroDossier().trim())
                .objet(dto.objet().trim())
                .description(dto.description())
                .tribunal(dto.tribunal())
                .juge(dto.juge())
                .procureur(dto.procureur())

                // Toujours EN_COURS à la création
                .statut(StatutDossier.EN_COURS)

                .utilisateur(utilisateur)
                .dateCreation(LocalDateTime.now())
                .build();

        DossierJudiciaire saved =
                dossierJudiciaireRepository.save(dossier);

        return toResponseDTO(saved);
    }

    /**
     * Consulter un dossier.
     */
    @Transactional(readOnly = true)
    public DossierResponseDTO getById(Long id) {

        DossierJudiciaire dossier =
                dossierJudiciaireRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Dossier introuvable"
                                )
                        );

        return toResponseDTO(dossier);
    }

    /**
     * Consulter tous les dossiers.
     */
    @Transactional(readOnly = true)
    public Page<DossierResponseDTO> getAll(Pageable pageable) {

        return dossierJudiciaireRepository
                .findAll(pageable)
                .map(this::toResponseDTO);
    }

    /**
     * Rechercher par numéro ou objet.
     */
    @Transactional(readOnly = true)
    public Page<DossierResponseDTO> search(
            String numeroDossier,
            String objet,
            Pageable pageable
    ) {

        Page<DossierJudiciaire> dossiers =
                dossierJudiciaireRepository
                        .findByNumeroDossierContainingIgnoreCaseOrObjetContainingIgnoreCase(
                                numeroDossier == null ? "" : numeroDossier,
                                objet == null ? "" : objet,
                                pageable
                        );

        return dossiers.map(this::toResponseDTO);
    }

    /**
     * Filtrer par statut.
     */
    @Transactional(readOnly = true)
    public Page<DossierResponseDTO> findByStatut(
            StatutDossier statut,
            Pageable pageable
    ) {

        return dossierJudiciaireRepository
                .findByStatut(statut, pageable)
                .map(this::toResponseDTO);
    }

    /**
     * Modifier un dossier.
     *
     * Transition autorisée :
     *
     * EN_COURS -> CLOTURE
     *
     * ARCHIVE ne peut PAS être défini ici.
     * Il faut obligatoirement utiliser archive().
     */
    @Transactional
    public DossierResponseDTO update(
            Long id,
            DossierUpdateDTO dto
    ) {

        DossierJudiciaire dossier =
                dossierJudiciaireRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Dossier introuvable"
                                )
                        );

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Les données de modification sont obligatoires"
            );
        }

        if (dto.objet() != null) {
            dossier.setObjet(dto.objet().trim());
        }

        if (dto.description() != null) {
            dossier.setDescription(dto.description());
        }

        if (dto.tribunal() != null) {
            dossier.setTribunal(dto.tribunal());
        }

        if (dto.juge() != null) {
            dossier.setJuge(dto.juge());
        }

        if (dto.procureur() != null) {
            dossier.setProcureur(dto.procureur());
        }

        /*
         * Gestion du cycle de vie :
         *
         * EN_COURS -> CLOTURE
         *
         * ARCHIVE passe obligatoirement
         * par la méthode archive().
         */
        if (dto.statut() != null
                && dto.statut() != dossier.getStatut()) {

            if (dossier.getStatut() == StatutDossier.EN_COURS
                    && dto.statut() == StatutDossier.CLOTURE) {

                dossier.setStatut(StatutDossier.CLOTURE);

            } else {

                throw new IllegalStateException(
                        "Transition de statut invalide. " +
                                "Le cycle autorisé est EN_COURS -> CLOTURE -> ARCHIVE."
                );
            }
        }

        dossier.setDateMaj(LocalDateTime.now());

        DossierJudiciaire updated =
                dossierJudiciaireRepository.save(dossier);

        return toResponseDTO(updated);
    }

    /**
     * Archiver un dossier.
     *
     * Transition :
     *
     * CLOTURE -> ARCHIVE
     *
     * Cette méthode doit être appelée uniquement
     * par l'ADMIN depuis le Controller.
     */
    @Transactional
    public DossierResponseDTO archive(Long id) {

        DossierJudiciaire dossier =
                dossierJudiciaireRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Dossier introuvable"
                                )
                        );

        /*
         * Impossible d'archiver directement
         * un dossier EN_COURS.
         */
        if (dossier.getStatut() != StatutDossier.CLOTURE) {

            throw new IllegalStateException(
                    "Seul un dossier CLOTURE peut être archivé."
            );
        }

        dossier.setStatut(StatutDossier.ARCHIVE);
        dossier.setDateMaj(LocalDateTime.now());

        DossierJudiciaire archived =
                dossierJudiciaireRepository.save(dossier);

        return toResponseDTO(archived);
    }

    /**
     * Supprimer un dossier.
     *
     * ADMIN :
     * peut supprimer n'importe quel dossier.
     *
     * UTILISATEUR :
     * peut supprimer uniquement ses propres dossiers.
     */
    @Transactional
    public void delete(
            Long id,
            String emailUtilisateur,
            boolean admin
    ) {

        DossierJudiciaire dossier =
                dossierJudiciaireRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Dossier introuvable"
                                )
                        );

        if (!admin) {

            if (dossier.getUtilisateur() == null
                    || dossier.getUtilisateur().getEmail() == null
                    || !dossier.getUtilisateur()
                    .getEmail()
                    .equalsIgnoreCase(emailUtilisateur)) {

                throw new IllegalArgumentException(
                        "Vous ne pouvez supprimer que vos propres dossiers"
                );
            }
        }

        dossierJudiciaireRepository.delete(dossier);
    }

    /**
     * Conversion Entity -> DTO.
     */
    private DossierResponseDTO toResponseDTO(
            DossierJudiciaire dossier
    ) {

        return new DossierResponseDTO(
                dossier.getId(),
                dossier.getNumeroDossier(),
                dossier.getObjet(),
                dossier.getDescription(),
                dossier.getTribunal(),
                dossier.getJuge(),
                dossier.getProcureur(),
                dossier.getStatut(),
                dossier.getDateCreation(),
                dossier.getDateMaj(),
                dossier.getUtilisateur() != null
                        ? dossier.getUtilisateur().getId()
                        : null
        );
    }
}