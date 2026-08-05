package com.pmp.sgdj.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.security.reset-token-validity-minutes}")
    private long resetTokenValidityMinutes;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("SGDJ - Reinitialisation de votre mot de passe");
        message.setText("""
                Bonjour,

                Une demande de reinitialisation de mot de passe a ete effectuee pour votre compte SGDJ.

                Cliquez sur le lien suivant pour choisir un nouveau mot de passe (valable %d minutes) :
                %s

                Ce lien ne peut etre utilise qu'une seule fois.

                Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email :
                votre mot de passe actuel reste inchange.

                Presidence du Ministere Public - SGDJ
                """.formatted(resetTokenValidityMinutes, resetLink));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Ne jamais faire echouer la requete cote utilisateur a cause d'un probleme SMTP ;
            // l'echec est journalise pour investigation cote serveur.
            log.error("Echec d'envoi de l'email de reinitialisation a {}", toEmail, e);
        }
    }
}
