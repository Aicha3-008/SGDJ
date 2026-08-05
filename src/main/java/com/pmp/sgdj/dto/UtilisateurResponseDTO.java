package com.pmp.sgdj.dto;

import com.pmp.sgdj.enums.Role;

import java.time.LocalDateTime;

/** Ne contient jamais le mot de passe (meme hache) : seule vue exposee par l'API. */
public record UtilisateurResponseDTO(
        Long id,
        String nom,
        String prenom,
        String username,
        String email,
        Role role,
        boolean actif,
        boolean compteVerrouille,
        LocalDateTime dateCreation,
        LocalDateTime derniereConnexion,
        String photoUrl
) {
}
