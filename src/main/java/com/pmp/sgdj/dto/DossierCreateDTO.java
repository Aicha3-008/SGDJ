package com.pmp.sgdj.dto;
import com.pmp.sgdj.enums.StatutDossier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DossierCreateDTO(

        @NotBlank(message = "Le numero du dossier est obligatoire")
        @Size(max = 50, message = "Le numero du dossier ne doit pas depasser 50 caracteres")
        String numeroDossier,

        @NotBlank(message = "L'objet du dossier est obligatoire")
        @Size(max = 255, message = "L'objet ne doit pas depasser 255 caracteres")
        String objet,

        String description,

        @Size(max = 150, message = "Le tribunal ne doit pas depasser 150 caracteres")
        String tribunal,

        @Size(max = 150, message = "Le juge ne doit pas depasser 150 caracteres")
        String juge,

        @Size(max = 150, message = "Le procureur ne doit pas depasser 150 caracteres")
        String procureur,

        StatutDossier statut
) {
}