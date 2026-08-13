package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.UtilisateurCreateDTO;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.dto.UtilisateurUpdateDTO;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.enums.Role;
import com.pmp.sgdj.exception.DuplicateResourceException;
import com.pmp.sgdj.exception.ResourceNotFoundException;
import com.pmp.sgdj.mapper.UtilisateurMapper;
import com.pmp.sgdj.repository.UtilisateurRepository;
import com.pmp.sgdj.repository.UtilisateurSpecifications;
import com.pmp.sgdj.util.UsernameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final UtilisateurMapper utilisateurMapper;

    @Transactional(readOnly = true)
    public Page<UtilisateurResponseDTO> search(String query, Role role, Boolean actif, Pageable pageable) {
        return utilisateurRepository
                .findAll(UtilisateurSpecifications.search(query, role, actif), pageable)
                .map(utilisateurMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public UtilisateurResponseDTO getById(Long id) {
        return utilisateurMapper.toResponseDTO(findEntity(id));
    }

    @Transactional
    public UtilisateurResponseDTO create(UtilisateurCreateDTO dto) {
        if (utilisateurRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Cet email est deja utilise");
        }

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(dto.nom())
                .prenom(dto.prenom())
                .username(generateUniqueUsername(dto.prenom(), dto.nom()))
                .email(dto.email())
                .motDePasse(passwordEncoder.encode(dto.motDePasse()))
                .role(dto.role())
                .actif(true)
                .build();

        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    /** Genere un nom d'utilisateur lisible a partir du prenom/nom et garantit son unicite. */
    private String generateUniqueUsername(String prenom, String nom) {
        String base = UsernameGenerator.slug(prenom, nom);
        String candidate = base;
        int suffix = 1;
        while (utilisateurRepository.existsByUsername(candidate)) {
            suffix++;
            candidate = base + suffix;
        }
        return candidate;
    }

    @Transactional
    public UtilisateurResponseDTO update(Long id, UtilisateurUpdateDTO dto) {
        Utilisateur utilisateur = findEntity(id);

        if (utilisateurRepository.existsByUsernameAndIdNot(dto.username(), id)) {
            throw new DuplicateResourceException("Ce nom d'utilisateur est deja utilise");
        }
        if (utilisateurRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new DuplicateResourceException("Cet email est deja utilise");
        }

        utilisateur.setNom(dto.nom());
        utilisateur.setPrenom(dto.prenom());
        utilisateur.setUsername(dto.username());
        utilisateur.setEmail(dto.email());
        utilisateur.setRole(dto.role());

        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public void delete(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur introuvable");
        }
        utilisateurRepository.deleteById(id);
    }

    @Transactional
    public UtilisateurResponseDTO desactiver(Long id) {
        Utilisateur utilisateur = findEntity(id);
        utilisateur.setActif(false);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponseDTO reactiver(Long id) {
        Utilisateur utilisateur = findEntity(id);
        utilisateur.setActif(true);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponseDTO deverrouiller(Long id) {
        Utilisateur utilisateur = findEntity(id);
        utilisateur.setCompteVerrouille(false);
        utilisateur.setTentativesEchouees(0);
        utilisateur.setLockedUntil(null);
        utilisateur.setUnlockToken(null);
        utilisateur.setUnlockTokenExpiration(null);
        return utilisateurMapper.toResponseDTO(utilisateurRepository.save(utilisateur));
    }

    private Utilisateur findEntity(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}
