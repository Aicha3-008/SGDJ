package com.pmp.sgdj.dto;

import com.pmp.sgdj.util.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(

        @NotBlank(message = "Le mot de passe actuel est obligatoire")
        String ancienMotDePasse,

        @ValidPassword
        String nouveauMotDePasse,

        @NotBlank(message = "La confirmation est obligatoire")
        String confirmationMotDePasse
) {
}
