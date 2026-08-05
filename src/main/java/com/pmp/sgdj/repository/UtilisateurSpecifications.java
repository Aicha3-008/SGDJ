package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.enums.Role;
import org.springframework.data.jpa.domain.Specification;

public final class UtilisateurSpecifications {

    private UtilisateurSpecifications() {
    }

    public static Specification<Utilisateur> search(String query, Role role, Boolean actif) {
        return (root, criteriaQuery, cb) -> {
            var predicates = cb.conjunction();

            if (query != null && !query.isBlank()) {
                String like = "%" + query.trim().toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("nom")), like),
                        cb.like(cb.lower(root.get("prenom")), like),
                        cb.like(cb.lower(root.get("username")), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }

            if (role != null) {
                predicates = cb.and(predicates, cb.equal(root.get("role"), role));
            }

            if (actif != null) {
                predicates = cb.and(predicates, cb.equal(root.get("actif"), actif));
            }

            return predicates;
        };
    }
}
