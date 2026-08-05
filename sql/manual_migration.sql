-- ============================================================================
-- SGDJ - Migration additive a executer UNE SEULE FOIS sur la base sgdj_db
-- existante (SANS rien recreer ni restructurer les tables actuelles).
--
-- Ajoute uniquement les colonnes strictement indispensables aux fonctionnalites
-- demandees :
--   - reset_token / reset_token_expiration : mot de passe oublie (email reel)
--   - photo                                : photo de profil
--
-- A executer manuellement, par exemple :
--   mysql -u root -p sgdj_db < sql/manual_migration.sql
-- ============================================================================

USE sgdj_db;

ALTER TABLE utilisateurs
    ADD COLUMN IF NOT EXISTS reset_token            VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS reset_token_expiration DATETIME     NULL,
    ADD COLUMN IF NOT EXISTS photo                  VARCHAR(500) NULL;
