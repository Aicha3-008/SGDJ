package com.pmp.sgdj.repository;

import com.pmp.sgdj.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long>, JpaSpecificationExecutor<Utilisateur> {

    Optional<Utilisateur> findByUsername(String username);

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByResetToken(String resetToken);

    Optional<Utilisateur> findByUnlockToken(String unlockToken);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameAndIdNot(String username, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Utilisateur> findTop5ByOrderByDateCreationDesc();

    long countByDateCreationAfter(LocalDateTime since);
}
