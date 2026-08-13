package com.pmp.sgdj.dto;

import jakarta.validation.constraints.NotBlank;

public record UnlockAccountRequest(

        @NotBlank(message = "Le jeton est obligatoire")
        String token
) {
}
