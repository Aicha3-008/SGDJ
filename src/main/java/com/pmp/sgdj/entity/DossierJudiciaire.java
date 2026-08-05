package com.pmp.sgdj.entity;

import com.pmp.sgdj.enums.StatutDossier;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dossiers_judiciaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DossierJudiciaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_dossier", unique = true, nullable = false)
    private String numeroDossier;

    @Column(nullable = false)
    private String objet;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String tribunal;
    private String juge;
    private String procureur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutDossier statut = StatutDossier.EN_COURS;

    @Column(name = "date_creation")
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_maj")
    private LocalDateTime dateMaj;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
}
