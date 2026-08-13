package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.AuthResponse;
import com.pmp.sgdj.dto.ForgotPasswordRequest;
import com.pmp.sgdj.dto.LoginRequest;
import com.pmp.sgdj.dto.MessageResponse;
import com.pmp.sgdj.dto.ResetPasswordRequest;
import com.pmp.sgdj.dto.UnlockAccountRequest;
import com.pmp.sgdj.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        // Authentification stateless (JWT) : rien a invalider cote serveur, le client
        // doit simplement supprimer le jeton qu'il detient.
        return ResponseEntity.ok(new MessageResponse("Deconnexion reussie"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new MessageResponse(
                "Si cet email est associe a un compte, un lien de reinitialisation vient d'etre envoye."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Mot de passe reinitialise avec succes"));
    }

    @PostMapping("/unlock-account")
    public ResponseEntity<MessageResponse> unlockAccount(@Valid @RequestBody UnlockAccountRequest request) {
        authService.unlockAccount(request);
        return ResponseEntity.ok(new MessageResponse("Compte reactive avec succes, vous pouvez vous reconnecter."));
    }
}
