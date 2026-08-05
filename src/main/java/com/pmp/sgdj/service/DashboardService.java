package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.DashboardStatsDTO;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.enums.StatutDossier;
import com.pmp.sgdj.mapper.UtilisateurMapper;
import com.pmp.sgdj.repository.DossierJudiciaireRepository;
import com.pmp.sgdj.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final DossierJudiciaireRepository dossierJudiciaireRepository;
    private final UtilisateurMapper utilisateurMapper;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        UtilisateurResponseDTO profil = utilisateurMapper.toResponseDTO(
                utilisateurRepository.findByEmail(authentication.getName()).orElseThrow());

        // La liste des derniers utilisateurs crees ne concerne que l'administrateur (gestion des comptes).
        List<UtilisateurResponseDTO> derniersUtilisateurs = isAdmin
                ? utilisateurRepository.findTop5ByOrderByDateCreationDesc().stream()
                        .map(utilisateurMapper::toResponseDTO)
                        .toList()
                : List.of();

        return new DashboardStatsDTO(
                utilisateurRepository.count(),
                dossierJudiciaireRepository.count(),
                dossierJudiciaireRepository.countByStatut(StatutDossier.ARCHIVE),
                derniersUtilisateurs,
                profil
        );
    }
}
