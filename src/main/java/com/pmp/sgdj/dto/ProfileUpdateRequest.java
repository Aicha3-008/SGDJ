package com.pmp.sgdj.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(

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
        String email
) {
}
