package com.pmp.sgdj.service;

import com.pmp.sgdj.dto.*;
import com.pmp.sgdj.entity.Utilisateur;
import com.pmp.sgdj.exception.AccountLockedException;
import com.pmp.sgdj.exception.BadCredentialsCustomException;
import com.pmp.sgdj.exception.InvalidTokenException;
import com.pmp.sgdj.mapper.UtilisateurMapper;
import com.pmp.sgdj.repository.UtilisateurRepository;
import com.pmp.sgdj.security.CustomUserDetailsService;
import com.pmp.sgdj.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UtilisateurMapper utilisateurMapper;
    private final EmailService emailService;

    @Value("${app.security.max-failed-attempts}")
    private int maxFailedAttempts;

    @Value("${app.security.reset-token-validity-minutes}")
    private long resetTokenValidityMinutes;

    // noRollbackFor est indispensable : sans cela, Spring annule (rollback) la mise a jour
    // du compteur d'echecs faite dans registerFailedAttempt() des qu'on leve
    // BadCredentialsCustomException juste apres -> la protection anti brute-force serait
    // silencieusement inoperante (le compteur ne serait jamais persiste en base).
    @Transactional(noRollbackFor = BadCredentialsCustomException.class)
    public AuthResponse login(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsCustomException("Identifiants invalides"));

        if (utilisateur.isCompteVerrouille()) {
            throw new AccountLockedException(
                    "Compte verrouille suite a plusieurs echecs de connexion. Contactez un administrateur.");
        }

        if (!passwordEncoder.matches(request.motDePasse(), utilisateur.getMotDePasse())) {
            registerFailedAttempt(utilisateur);
            throw new BadCredentialsCustomException("Identifiants invalides");
        }

        if (!utilisateur.isActif()) {
            throw new BadCredentialsCustomException("Identifiants invalides");
        }

        utilisateur.setTentativesEchouees(0);
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);

        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, "Bearer", jwtService.getExpirationMillis(),
                utilisateurMapper.toResponseDTO(utilisateur));
    }

    private void registerFailedAttempt(Utilisateur utilisateur) {
        int tentatives = utilisateur.getTentativesEchouees() + 1;
        utilisateur.setTentativesEchouees(tentatives);
        if (tentatives >= maxFailedAttempts) {
            utilisateur.setCompteVerrouille(true);
        }
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void changePassword(String currentUserEmail, ChangePasswordRequest request) {
        if (!request.nouveauMotDePasse().equals(request.confirmationMotDePasse())) {
            throw new IllegalArgumentException("La confirmation ne correspond pas au nouveau mot de passe");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new BadCredentialsCustomException("Identifiants invalides"));

        if (!passwordEncoder.matches(request.ancienMotDePasse(), utilisateur.getMotDePasse())) {
            // Erreur de saisie utilisateur (400), pas un probleme de session -> ne doit pas
            // declencher la deconnexion automatique cote frontend reservee aux 401.
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        utilisateurRepository.findByEmail(request.email()).ifPresent(utilisateur -> {
            String token = UUID.randomUUID().toString();
            utilisateur.setResetToken(token);
            utilisateur.setResetTokenExpiration(LocalDateTime.now().plusMinutes(resetTokenValidityMinutes));
            utilisateurRepository.save(utilisateur);
            emailService.sendPasswordResetEmail(utilisateur.getEmail(), token);
        });
        // Reponse identique que l'email existe ou non, pour ne pas permettre l'enumeration des comptes.
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.nouveauMotDePasse().equals(request.confirmationMotDePasse())) {
            throw new IllegalArgumentException("La confirmation ne correspond pas au nouveau mot de passe");
        }

        Utilisateur utilisateur = utilisateurRepository.findByResetToken(request.token())
                .orElseThrow(() -> new InvalidTokenException("Jeton de reinitialisation invalide"));

        if (utilisateur.getResetTokenExpiration() == null
                || utilisateur.getResetTokenExpiration().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Jeton de reinitialisation expire");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
        utilisateur.setResetToken(null);
        utilisateur.setResetTokenExpiration(null);
        utilisateur.setTentativesEchouees(0);
        utilisateur.setCompteVerrouille(false);
        utilisateurRepository.save(utilisateur);
    }
}
