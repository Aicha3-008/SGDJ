package com.pmp.sgdj.dto;

import com.pmp.sgdj.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Modification par l'administrateur : le mot de passe ne se change jamais ici (voir reinitialisation). */
public record UtilisateurUpdateDTO(

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100)
        String nom,

        @NotBlank(message = "Le prenom est obligatoire")
        @Size(max = 100)
        String prenom,

        @NotBlank(message = "Le nom d'utilisateur est obligatoire")
        @Size(max = 50)
        String username,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 150)
        String email,

        @NotNull(message = "Le role est obligatoire")
        Role role
) {
}
