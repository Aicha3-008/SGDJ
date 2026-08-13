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

import java.time.Duration;
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

    @Value("${app.security.lockout-step1-minutes}")
    private long lockoutStep1Minutes;

    @Value("${app.security.lockout-step2-minutes}")
    private long lockoutStep2Minutes;

    @Value("${app.security.reset-token-validity-minutes}")
    private long resetTokenValidityMinutes;

    @Value("${app.security.unlock-token-validity-minutes}")
    private long unlockTokenValidityMinutes;

    // noRollbackFor est indispensable : sans cela, Spring annule (rollback) la mise a jour
    // du compteur d'echecs faite dans registerFailedAttempt() des qu'on leve une exception
    // juste apres -> la protection anti brute-force serait silencieusement inoperante
    // (le compteur/verrouillage ne serait jamais persiste en base).
    @Transactional(noRollbackFor = {BadCredentialsCustomException.class, AccountLockedException.class})
    public AuthResponse login(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsCustomException("Identifiants invalides"));

        if (utilisateur.isCompteVerrouille()) {
            throw new AccountLockedException(
                    "Compte verrouille suite a plusieurs echecs de connexion. "
                            + "Un email de reactivation vous a ete envoye : cliquez sur le lien qu'il contient "
                            + "pour reactiver votre compte.");
        }

        if (utilisateur.getLockedUntil() != null && utilisateur.getLockedUntil().isAfter(LocalDateTime.now())) {
            long seconds = secondsUntil(utilisateur.getLockedUntil());
            throw new AccountLockedException(
                    "Trop de tentatives de connexion. Veuillez patienter encore "
                            + formatWait(seconds) + " avant de reessayer.",
                    seconds);
        }

        if (!passwordEncoder.matches(request.motDePasse(), utilisateur.getMotDePasse())) {
            registerFailedAttempt(utilisateur);
            // registerFailedAttempt vient de fixer lockedUntil (echec 1 ou 2) ou compteVerrouille
            // (echec 3) : on renvoie immediatement le message correspondant plutot qu'un message
            // generique, pour informer l'utilisateur du temps d'attente ou de l'envoi de l'email.
            if (utilisateur.isCompteVerrouille()) {
                throw new AccountLockedException(
                        "Trop de tentatives echouees : votre compte vient d'etre verrouille. "
                                + "Un email de reactivation vous a ete envoye.");
            }
            long seconds = secondsUntil(utilisateur.getLockedUntil());
            throw new AccountLockedException(
                    "Identifiants invalides. Nouvelle tentative possible dans " + formatWait(seconds) + ".",
                    seconds);
        }

        if (!utilisateur.isActif()) {
            throw new BadCredentialsCustomException("Identifiants invalides");
        }

        utilisateur.setTentativesEchouees(0);
        utilisateur.setLockedUntil(null);
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);

        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, "Bearer", jwtService.getExpirationMillis(),
                utilisateurMapper.toResponseDTO(utilisateur));
    }

    /** Verrouillage progressif : echec 1 -> attente courte, echec 2 -> attente longue, echec 3 -> verrouillage + email. */
    private void registerFailedAttempt(Utilisateur utilisateur) {
        int tentatives = utilisateur.getTentativesEchouees() + 1;
        utilisateur.setTentativesEchouees(tentatives);

        if (tentatives >= maxFailedAttempts) {
            utilisateur.setCompteVerrouille(true);
            utilisateur.setLockedUntil(null);

            String token = UUID.randomUUID().toString();
            utilisateur.setUnlockToken(token);
            utilisateur.setUnlockTokenExpiration(LocalDateTime.now().plusMinutes(unlockTokenValidityMinutes));
            utilisateurRepository.save(utilisateur);

            emailService.sendAccountLockedEmail(utilisateur.getEmail(), token);
            return;
        }

        long minutes = tentatives == 1 ? lockoutStep1Minutes : lockoutStep2Minutes;
        utilisateur.setLockedUntil(LocalDateTime.now().plusMinutes(minutes));
        utilisateurRepository.save(utilisateur);
    }

    private long secondsUntil(LocalDateTime until) {
        return Math.max(0, Duration.between(LocalDateTime.now(), until).getSeconds());
    }

    private String formatWait(long seconds) {
        if (seconds < 60) {
            return seconds + " seconde(s)";
        }
        long minutes = (seconds + 59) / 60;
        return minutes + " minute(s)";
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
        clearLockoutState(utilisateur);
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void unlockAccount(UnlockAccountRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByUnlockToken(request.token())
                .orElseThrow(() -> new InvalidTokenException("Jeton de reactivation invalide"));

        if (utilisateur.getUnlockTokenExpiration() == null
                || utilisateur.getUnlockTokenExpiration().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Jeton de reactivation expire. Contactez un administrateur.");
        }

        clearLockoutState(utilisateur);
        utilisateurRepository.save(utilisateur);
    }

    private void clearLockoutState(Utilisateur utilisateur) {
        utilisateur.setTentativesEchouees(0);
        utilisateur.setCompteVerrouille(false);
        utilisateur.setLockedUntil(null);
        utilisateur.setUnlockToken(null);
        utilisateur.setUnlockTokenExpiration(null);
    }
}
