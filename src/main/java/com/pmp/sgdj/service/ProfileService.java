package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.ProfileUpdateRequest;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.exception.BadCredentialsCustomException;
import com.pmp.sgdj.exception.DuplicateResourceException;
import com.pmp.sgdj.mapper.UtilisateurMapper;
import com.pmp.sgdj.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public UtilisateurResponseDTO getProfile(String email) {
        return utilisateurMapper.toResponseDTO(findEntity(email));
    }

    @Transactional
    public UtilisateurResponseDTO updateProfile(String email, ProfileUpdateRequest dto) {
        Utilisateur utilisateur = findEntity(email);

        if (utilisateurRepository.existsByUsernameAndIdNot(dto.username(), utilisateur.getId())) {
            throw new DuplicateResourceException("Ce nom d'utilisateur est deja utilise");
        }
        if (utilisateurRepository.existsByEmailAndIdNot(dto.email(), utilisateur.getId())) {
            throw new DuplicateResourceException("Cet email est deja utilise");
        }

        utilisateur.setNom(dto.nom());
        utilisateur.setPrenom(dto.prenom());
        utilisateur.setUsername(dto.username());
        utilisateur.setEmail(dto.email());

        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponseDTO updatePhoto(String email, MultipartFile file) {
        Utilisateur utilisateur = findEntity(email);

        String ancienne = utilisateur.getPhoto();
        String nouveau = fileStorageService.storeProfilePhoto(file);
        utilisateur.setPhoto(nouveau);
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        if (ancienne != null) {
            fileStorageService.deleteProfilePhoto(ancienne);
        }

        return utilisateurMapper.toResponseDTO(saved);
    }

    private Utilisateur findEntity(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsCustomException("Utilisateur introuvable"));
    }
}
