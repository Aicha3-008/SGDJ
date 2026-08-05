package com.pmp.sgdj.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/** Genere un identifiant lisible (ex: "ybenali") a partir du prenom/nom, sans accents ni espaces. */
public final class UsernameGenerator {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}");
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]");
    private static final int MAX_BASE_LENGTH = 40; // laisse de la place pour un suffixe numerique (colonne VARCHAR(50))

    private UsernameGenerator() {
    }

    public static String slug(String prenom, String nom) {
        String initiale = (prenom == null || prenom.isBlank()) ? "" : prenom.trim().substring(0, 1);
        String raw = initiale + (nom == null ? "" : nom.trim());

        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS.matcher(normalized).replaceAll("");
        String cleaned = NON_ALNUM.matcher(withoutDiacritics.toLowerCase()).replaceAll("");

        if (cleaned.isBlank()) {
            cleaned = "utilisateur";
        }

        return cleaned.length() > MAX_BASE_LENGTH ? cleaned.substring(0, MAX_BASE_LENGTH) : cleaned;
    }
}
