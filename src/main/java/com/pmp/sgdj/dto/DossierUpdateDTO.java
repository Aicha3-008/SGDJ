package com.pmp.sgdj.dto;

import com.pmp.sgdj.enums.StatutDossier;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DossierUpdateDTO(

        @Pattern(
                regexp = "^$|\\d+",
                message = "Le numero du dossier doit contenir uniquement des chiffres"
        )
        @Size(
                max = 50,
                message = "Le numero du dossier ne doit pas depasser 50 caracteres"
        )
        String numeroDossier,

        @Pattern(
                regexp = "^$|^[\\p{L}]+(?:[ '-][\\p{L}]+)*$",
                message = "L'objet doit contenir uniquement des lettres, espaces, apostrophes ou tirets"
        )
        @Size(
                max = 255,
                message = "L'objet ne doit pas depasser 255 caracteres"
        )
        String objet,

        String description,

        @Pattern(
                regexp = "^$|^[\\p{L}]+(?:[ '-][\\p{L}]+)*$",
                message = "Le tribunal doit contenir uniquement des lettres, espaces, apostrophes ou tirets"
        )
        @Size(
                max = 150,
                message = "Le tribunal ne doit pas depasser 150 caracteres"
        )
        String tribunal,

        @Pattern(
                regexp = "^$|^[\\p{L}]+(?:[ '-][\\p{L}]+)*$",
                message = "Le juge doit contenir uniquement des lettres, espaces, apostrophes ou tirets"
        )
        @Size(
                max = 150,
                message = "Le juge ne doit pas depasser 150 caracteres"
        )
        String juge,

        @Pattern(
                regexp = "^$|^[\\p{L}]+(?:[ '-][\\p{L}]+)*$",
                message = "Le procureur doit contenir uniquement des lettres, espaces, apostrophes ou tirets"
        )
        @Size(
                max = 150,
                message = "Le procureur ne doit pas depasser 150 caracteres"
        )
        String procureur,

        StatutDossier statut
) {
}
