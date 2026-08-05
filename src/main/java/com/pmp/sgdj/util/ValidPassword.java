package com.pmp.sgdj.util;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Politique de mot de passe conforme aux recommandations OWASP ASVS V2.1 :
 * au moins 12 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.
 */
@Documented
@Constraint(validatedBy = PasswordPolicyValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Le mot de passe doit contenir au moins 12 caracteres, "
            + "une majuscule, une minuscule, un chiffre et un caractere special";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
