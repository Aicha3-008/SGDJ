package com.pmp.sgdj.mapper;

import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.entity.Utilisateur;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurMapper {

    @Value("${app.upload.photos-dir}")
    private String photosDir;

    public UtilisateurResponseDTO toResponseDTO(Utilisateur u) {
        if (u == null) {
            return null;
        }
        return new UtilisateurResponseDTO(
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getUsername(),
                u.getEmail(),
                u.getRole(),
                u.isActif(),
                u.isCompteVerrouille(),
                u.getDateCreation(),
                u.getDerniereConnexion(),
                buildPhotoUrl(u.getPhoto())
        );
    }

    private String buildPhotoUrl(String photo) {
        if (photo == null || photo.isBlank()) {
            return null;
        }
        return "/" + photosDir + "/" + photo;
    }
}
