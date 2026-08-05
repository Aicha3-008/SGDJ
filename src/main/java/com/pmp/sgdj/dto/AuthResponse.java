package com.pmp.sgdj.dto;

public record AuthResponse(String token, String type, long expiresIn, UtilisateurResponseDTO utilisateur) {
}
