package com.pmp.sgdj.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.pmp.sgdj.entity.DossierJudiciaire;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.repository.DossierJudiciaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class DossierPdfService {

    private final DossierJudiciaireRepository dossierJudiciaireRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Générer le PDF d'un dossier.
     *
     * ADMIN :
     * peut télécharger tous les dossiers.
     *
     * UTILISATEUR :
     * peut télécharger uniquement ses propres dossiers.
     */
    @Transactional(readOnly = true)
    public byte[] generatePdf(
            Long dossierId,
            Authentication authentication
    ) {

        // ==================================================
        // CHERCHER LE DOSSIER
        // ==================================================

        DossierJudiciaire dossier =
                dossierJudiciaireRepository.findById(dossierId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Dossier introuvable"
                                )
                        );

        // ==================================================
        // VÉRIFIER L'UTILISATEUR CONNECTÉ
        // ==================================================

        if (authentication == null) {
            throw new AccessDeniedException(
                    "Utilisateur non authentifié."
            );
        }

        String emailUtilisateur =
                authentication.getName();

        // ==================================================
        // VÉRIFIER SI ADMIN
        // ==================================================

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );

        // ==================================================
        // VÉRIFIER LE PROPRIÉTAIRE
        // ==================================================

        Utilisateur utilisateur =
                dossier.getUtilisateur();

        if (utilisateur == null) {

            throw new IllegalStateException(
                    "Ce dossier n'est associé à aucun utilisateur."
            );
        }

        boolean isOwner =
                utilisateur.getEmail() != null
                        && utilisateur.getEmail()
                        .equalsIgnoreCase(emailUtilisateur);

        // ==================================================
        // AUTORISATION
        // ==================================================

        if (!isAdmin && !isOwner) {

            throw new AccessDeniedException(
                    "Vous ne pouvez télécharger que vos propres dossiers."
            );
        }

        // ==================================================
        // GÉNÉRER LE PDF
        // ==================================================

        return createPdf(dossier);
    }


    // ======================================================
    // CRÉATION DU PDF
    // ======================================================

    private byte[] createPdf(
            DossierJudiciaire dossier
    ) {

        try {

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            Document document =
                    new Document(
                            PageSize.A4,
                            45,
                            45,
                            45,
                            45
                    );

            PdfWriter.getInstance(
                    document,
                    output
            );

            document.open();

            // ==================================================
            // POLICES
            // ==================================================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20,
                            Color.BLACK
                    );

            Font subtitleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            10,
                            Color.DARK_GRAY
                    );

            Font sectionFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            12,
                            Color.BLACK
                    );

            Font labelFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            10,
                            Color.DARK_GRAY
                    );

            Font valueFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            10,
                            Color.BLACK
                    );

            Font footerFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            8,
                            Color.GRAY
                    );

            // ==================================================
            // EN-TÊTE
            // ==================================================

            Paragraph title =
                    new Paragraph(
                            "DOSSIER JUDICIAIRE",
                            titleFont
                    );

            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);

            document.add(title);

            Paragraph subtitle =
                    new Paragraph(
                            "Système de Gestion des Dossiers Judiciaires",
                            subtitleFont
                    );

            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);

            document.add(subtitle);

            // ==================================================
            // NUMÉRO DU DOSSIER
            // ==================================================

            PdfPTable headerTable =
                    new PdfPTable(2);

            headerTable.setWidthPercentage(100);

            headerTable.setWidths(
                    new float[]{70, 30}
            );

            PdfPCell dossierNumberCell =
                    new PdfPCell(
                            new Phrase(
                                    "Dossier n° "
                                            + safe(
                                            dossier.getNumeroDossier()
                                    ),
                                    sectionFont
                            )
                    );

            dossierNumberCell.setBorder(
                    Rectangle.NO_BORDER
            );

            dossierNumberCell.setPadding(8);

            PdfPCell statutCell =
                    new PdfPCell(
                            new Phrase(
                                    safeStatus(
                                            dossier
                                    ),
                                    valueFont
                            )
                    );

            statutCell.setHorizontalAlignment(
                    Element.ALIGN_CENTER
            );

            statutCell.setVerticalAlignment(
                    Element.ALIGN_MIDDLE
            );

            statutCell.setPadding(8);

            statutCell.setBackgroundColor(
                    getStatusColor(
                            dossier
                    )
            );

            headerTable.addCell(
                    dossierNumberCell
            );

            headerTable.addCell(
                    statutCell
            );

            document.add(headerTable);

            document.add(
                    new Paragraph(" ")
            );

            // ==================================================
            // INFORMATIONS DU DOSSIER
            // ==================================================

            document.add(
                    createSectionTitle(
                            "Informations du dossier",
                            sectionFont
                    )
            );

            PdfPTable infoTable =
                    new PdfPTable(2);

            infoTable.setWidthPercentage(100);

            infoTable.setWidths(
                    new float[]{30, 70}
            );

            addRow(
                    infoTable,
                    "Numéro de dossier",
                    safe(dossier.getNumeroDossier()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Objet",
                    safe(dossier.getObjet()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Description",
                    safe(dossier.getDescription()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Tribunal",
                    safe(dossier.getTribunal()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Juge",
                    safe(dossier.getJuge()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Procureur",
                    safe(dossier.getProcureur()),
                    labelFont,
                    valueFont
            );

            addRow(
                    infoTable,
                    "Statut",
                    safeStatus(dossier),
                    labelFont,
                    valueFont
            );

            document.add(infoTable);

            document.add(
                    new Paragraph(" ")
            );

            // ==================================================
            // DATES
            // ==================================================

            document.add(
                    createSectionTitle(
                            "Dates",
                            sectionFont
                    )
            );

            PdfPTable datesTable =
                    new PdfPTable(2);

            datesTable.setWidthPercentage(100);

            datesTable.setWidths(
                    new float[]{30, 70}
            );

            addRow(
                    datesTable,
                    "Date de création",
                    formatDate(
                            dossier.getDateCreation()
                    ),
                    labelFont,
                    valueFont
            );

            addRow(
                    datesTable,
                    "Dernière modification",
                    formatDate(
                            dossier.getDateMaj()
                    ),
                    labelFont,
                    valueFont
            );

            document.add(datesTable);

            document.add(
                    new Paragraph(" ")
            );

            // ==================================================
            // UTILISATEUR
            // ==================================================

            document.add(
                    createSectionTitle(
                            "Utilisateur",
                            sectionFont
                    )
            );

            PdfPTable userTable =
                    new PdfPTable(2);

            userTable.setWidthPercentage(100);

            userTable.setWidths(
                    new float[]{30, 70}
            );

            if (dossier.getUtilisateur() != null) {

                addRow(
                        userTable,
                        "Email",
                        safe(
                                dossier.getUtilisateur()
                                        .getEmail()
                        ),
                        labelFont,
                        valueFont
                );

            } else {

                addRow(
                        userTable,
                        "Utilisateur",
                        "-",
                        labelFont,
                        valueFont
                );
            }

            document.add(userTable);

            document.add(
                    new Paragraph(" ")
            );

            // ==================================================
            // MESSAGE
            // ==================================================

            Paragraph info =
                    new Paragraph(
                            "Ce document a été généré automatiquement par le SGDJ.",
                            footerFont
                    );

            info.setAlignment(
                    Element.ALIGN_CENTER
            );

            info.setSpacingBefore(20);

            document.add(info);

            // ==================================================
            // PIED DE PAGE
            // ==================================================

            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Erreur lors de la génération du PDF.",
                    e
            );
        }
    }


    // ======================================================
    // TITRE DE SECTION
    // ======================================================

    private Paragraph createSectionTitle(
            String text,
            Font font
    ) {

        Paragraph paragraph =
                new Paragraph(
                        text,
                        font
                );

        paragraph.setSpacingBefore(8);
        paragraph.setSpacingAfter(8);

        return paragraph;
    }


    // ======================================================
    // AJOUTER UNE LIGNE
    // ======================================================

    private void addRow(
            PdfPTable table,
            String label,
            String value,
            Font labelFont,
            Font valueFont
    ) {

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(
                                label,
                                labelFont
                        )
                );

        labelCell.setBackgroundColor(
                new Color(
                        240,
                        240,
                        240
                )
        );

        labelCell.setPadding(7);

        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(
                                value,
                                valueFont
                        )
                );

        valueCell.setPadding(7);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }


    // ======================================================
    // FORMAT DATE
    // ======================================================

    private String formatDate(
            java.time.LocalDateTime date
    ) {

        if (date == null) {
            return "-";
        }

        return date.format(
                DATE_FORMAT
        );
    }


    // ======================================================
    // STATUT
    // ======================================================

    private String safeStatus(
            DossierJudiciaire dossier
    ) {

        if (dossier.getStatut() == null) {
            return "-";
        }

        return switch (
                dossier.getStatut().toString()
                ) {

            case "EN_COURS" ->
                    "EN COURS";

            case "CLOTURE" ->
                    "CLOTURÉ";

            case "ARCHIVE" ->
                    "ARCHIVÉ";

            default ->
                    dossier.getStatut().toString();
        };
    }


    // ======================================================
    // COULEUR STATUT
    // ======================================================

    private Color getStatusColor(
            DossierJudiciaire dossier
    ) {

        if (dossier.getStatut() == null) {
            return new Color(
                    230,
                    230,
                    230
            );
        }

        return switch (
                dossier.getStatut().toString()
                ) {

            case "EN_COURS" ->
                    new Color(
                            220,
                            235,
                            250
                    );

            case "CLOTURE" ->
                    new Color(
                            220,
                            245,
                            225
                    );

            case "ARCHIVE" ->
                    new Color(
                            250,
                            235,
                            200
                    );

            default ->
                    new Color(
                            230,
                            230,
                            230
                    );
        };
    }


    // ======================================================
    // ÉVITER NULL
    // ======================================================

    private String safe(
            String value
    ) {

        if (value == null
                || value.trim().isEmpty()) {

            return "-";
        }

        return value;
    }
}