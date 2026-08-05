-- ============================================================================
-- SGDJ - Schema de reference (base sgdj_db deja creee en production).
-- Ce fichier n'est PAS execute automatiquement par l'application
-- (spring.jpa.hibernate.ddl-auto=validate). Il sert uniquement de reference
-- et pour recreer une base de developpement identique a la base reelle si besoin.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sgdj_db CHARACTER SET utf8mb4;
USE sgdj_db;

-- Table des utilisateurs (Utilisateur + Administrateur fusionnes via 'role')
CREATE TABLE utilisateurs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,          -- hache avec BCrypt
    role            ENUM('ADMIN','UTILISATEUR') NOT NULL DEFAULT 'UTILISATEUR',
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    tentatives_echouees INT NOT NULL DEFAULT 0,      -- protection brute-force
    compte_verrouille  BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME NULL
) ENGINE=InnoDB;

-- Table des dossiers judiciaires
CREATE TABLE dossiers_judiciaires (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_dossier  VARCHAR(50) NOT NULL UNIQUE,
    objet           VARCHAR(255) NOT NULL,
    description     TEXT,
    tribunal        VARCHAR(150),
    juge            VARCHAR(150),
    procureur       VARCHAR(150),
    statut          ENUM('EN_COURS','CLOTURE','ARCHIVE') NOT NULL DEFAULT 'EN_COURS',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_maj        DATETIME NULL,
    utilisateur_id  BIGINT NOT NULL,
    CONSTRAINT fk_dossier_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- Table des documents (pieces jointes d'un dossier)
CREATE TABLE documents (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_fichier     VARCHAR(255) NOT NULL,
    type_fichier    VARCHAR(50),
    chemin_fichier  VARCHAR(500) NOT NULL,
    taille          BIGINT,
    date_ajout      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dossier_id      BIGINT NOT NULL,
    CONSTRAINT fk_document_dossier
        FOREIGN KEY (dossier_id) REFERENCES dossiers_judiciaires(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Colonnes additionnelles necessaires aux fonctionnalites Authentification / Profil
-- (voir sql/manual_migration.sql pour la version a executer sur la base existante).
ALTER TABLE utilisateurs ADD COLUMN reset_token             VARCHAR(255) NULL;
ALTER TABLE utilisateurs ADD COLUMN reset_token_expiration  DATETIME     NULL;
ALTER TABLE utilisateurs ADD COLUMN photo                   VARCHAR(500) NULL;
