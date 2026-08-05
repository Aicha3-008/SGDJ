package com.pmp.sgdj.controller;

import com.pmp.sgdj.dto.ChangePasswordRequest;
import com.pmp.sgdj.dto.MessageResponse;
import com.pmp.sgdj.dto.ProfileUpdateRequest;
import com.pmp.sgdj.dto.UtilisateurResponseDTO;
import com.pmp.sgdj.service.AuthService;
import com.pmp.sgdj.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<UtilisateurResponseDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<UtilisateurResponseDTO> updateProfile(Authentication authentication,
                                                                  @Valid @RequestBody ProfileUpdateRequest dto) {
        return ResponseEntity.ok(profileService.updateProfile(authentication.getName(), dto));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(Authentication authentication,
                                                            @Valid @RequestBody ChangePasswordRequest dto) {
        authService.changePassword(authentication.getName(), dto);
        return ResponseEntity.ok(new MessageResponse("Mot de passe modifie avec succes"));
    }

    @PostMapping(value = "/photo", consumes = "multipart/form-data")
    public ResponseEntity<UtilisateurResponseDTO> uploadPhoto(Authentication authentication,
                                                                @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.updatePhoto(authentication.getName(), file));
    }
}
