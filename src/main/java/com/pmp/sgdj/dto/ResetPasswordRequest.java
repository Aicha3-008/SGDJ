package com.pmp.sgdj.dto;

import com.pmp.sgdj.util.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(

        @NotBlank(message = "Le jeton est obligatoire")
        String token,

        @ValidPassword
        String nouveauMotDePasse,

        @NotBlank(message = "La confirmation est obligatoire")
        String confirmationMotDePasse
) {
}
