# SGDJ — Système de Gestion des Dossiers Judiciaires

Application web sécurisée destinée à la Présidence du Ministère Public (PMP), développée dans le cadre d'un Projet de Fin d'Année (PFA) portant sur la sécurité des applications web (OWASP ASVS / OWASP Top 10).

Ce dépôt contient le **backend** (Spring Boot 4.1 / Java 17) et le **frontend** (React + Vite) des quatre modules suivants : **Authentification**, **Tableau de bord**, **Gestion des utilisateurs**, **Gestion du profil**.

> La gestion des dossiers judiciaires, des documents et l'audit ne sont **pas** implémentés dans ce dépôt — seuls les 4 modules ci-dessus ont été demandés à ce stade.

---

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | Java 17, Spring Boot 4.1, Spring Security, Spring Data JPA (Hibernate), JWT (jjwt), BCrypt, JavaMailSender, Maven |
| Base de données | MySQL (`sgdj_db`) |
| Frontend | React 19, Vite, React Router, Axios |

---

## Architecture

### Backend (`src/main/java/com/pmp/sgdj`)

```
config/       CORS, sécurité web, serveur de fichiers statiques (photos de profil)
controller/   Points d'entrée REST (Auth, Utilisateur, Profile, Dashboard, Dossier*, Document*)
dto/          Objets d'échange (jamais l'entité brute, jamais le mot de passe)
entity/       Entités JPA (Utilisateur, DossierJudiciaire, Document)
enums/        Role (ADMIN, UTILISATEUR), StatutDossier
exception/    Exceptions métier + gestionnaire centralisé (@RestControllerAdvice)
mapper/       Conversion Entité <-> DTO
repository/   Spring Data JPA + Specifications (recherche dynamique)
security/     JwtService, CustomUserDetailsService, filtre JWT, handlers 401/403
service/      Logique métier (Auth, Utilisateur, Profile, Dashboard, Email, FileStorage)
util/         Génération de username, politique de mot de passe (@ValidPassword)
```
_(`DossierController`/`DocumentController`/leurs services sont des coquilles vides, laissées pour un futur binôme/itération — hors périmètre actuel.)_

### Frontend (`frontend/src`)

```
api/            Client Axios (intercepteur JWT auto) + un service par domaine
auth/           AuthContext, useAuth, stockage du token
components/     Layout, ProtectedRoute, Pagination, ConfirmDialog, LoadingSpinner...
notifications/  Système de toasts
pages/          Login, ForgotPassword, ResetPassword, Dashboard, Users (liste/form), Profile
utils/          Politique de mot de passe, debounce
```

---

## Fonctionnalités implémentées

### Authentification
- Connexion par **email** + mot de passe (JWT, expiration 1h par défaut)
- Déconnexion (suppression du jeton côté client — API stateless)
- Changement de mot de passe (utilisateur connecté)
- Mot de passe oublié → email réel (JavaMailSender/SMTP) avec lien de réinitialisation (jeton à usage unique, expiration 10 min)
- Verrouillage automatique du compte après 5 échecs de connexion, déverrouillage manuel par l'admin
- Messages d'erreur génériques (pas d'énumération des comptes existants)

### Gestion des utilisateurs (ADMIN uniquement)
- Créer, modifier, supprimer, activer/désactiver, déverrouiller un utilisateur
- Recherche (nom/prénom/username/email), filtres (rôle, statut), tri, pagination
- Le **nom d'utilisateur est généré automatiquement** (ex: `Aicha Chrika` → `achrika`) à la création — l'admin ne le saisit plus manuellement
- Protection : un admin ne peut pas se désactiver/supprimer lui-même

### Gestion du profil (tout utilisateur connecté)
- Consulter / modifier ses informations (nom, prénom, username, email)
- Changer son mot de passe
- Changer sa photo de profil (JPEG/PNG/WebP, 2 Mo max, nom de fichier généré côté serveur)

### Tableau de bord
- Nombre total d'utilisateurs, de dossiers, de dossiers archivés
- Derniers utilisateurs créés (visible uniquement par l'ADMIN)
- Informations du profil connecté

---

## Sécurité (OWASP ASVS / Top 10)

- Mots de passe hachés avec **BCrypt** (force 12), jamais renvoyés par l'API
- **JWT** signé (HMAC-SHA), transmis via l'en-tête `Authorization`, jamais en cookie
- **RBAC** appliqué à la fois côté route (`SecurityConfig`) et méthode (`@PreAuthorize`)
- **CSRF désactivé** volontairement (justifié : API stateless sans cookie de session, donc pas de rejeu possible depuis un site tiers)
- **CORS** restreint à l'origine explicite du frontend (pas de wildcard `*`)
- Validation serveur systématique (`@Valid`) + politique de mot de passe (12+ car., maj/min/chiffre/spécial)
- Protection anti brute-force (compteur d'échecs + verrouillage)
- Upload de fichiers : whitelist de types MIME, nom de fichier régénéré côté serveur (anti path-traversal)
- Gestion centralisée des erreurs, aucun message ne révèle de détail technique ou l'existence d'un compte
- DTOs partout : les entités JPA ne sont jamais exposées directement

---

## Prérequis

- JDK 17+ (le projet compile avec un JDK plus récent tant que `--release 17` est respecté)
- Maven (ou le wrapper `mvnw`)
- Node.js 18+ / npm
- MySQL avec la base `sgdj_db` déjà créée (voir `sql/schema_reference.sql` pour la structure de référence)

---

## Installation

### 1. Base de données

La base `sgdj_db` existe déjà avec ses tables. Exécuter **une seule fois** la migration additive (ajoute uniquement les colonnes nécessaires à l'authentification/profil, ne touche à rien d'existant) :

```bash
mysql -u root -p sgdj_db < sql/manual_migration.sql
```

Colonnes ajoutées sur `utilisateurs` : `reset_token`, `reset_token_expiration`, `photo`.

### 2. Backend

Configurer `src/main/resources/application.yml` (ou variables d'environnement) :

```yaml
DB_USERNAME / DB_PASSWORD        # accès MySQL (par defaut root / vide)
MAIL_USERNAME / MAIL_PASSWORD    # compte Gmail expediteur + mot de passe d'application
JWT_SECRET                       # a changer en production (256 bits minimum)
```

Pour le SMTP Gmail : activer la validation en 2 étapes sur le compte expéditeur, puis générer un mot de passe d'application sur https://myaccount.google.com/apppasswords.

Lancer le backend (port **8080**) :

```bash
mvn spring-boot:run
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sur **http://localhost:5173**, configuré pour appeler l'API sur `http://localhost:8080/api` (modifiable dans `frontend/.env`).

---

## Comptes de test (seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | `admin@pmp.ma` | `Admin@PMP2026!` |
| UTILISATEUR | `utilisateur@pmp.ma` | `User@PMP2026!` |

**À changer immédiatement** après la première connexion (via "Mon profil" ou "Mot de passe oublié").

---

## Principaux endpoints API

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authentifié |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET/PUT | `/api/profile` | Authentifié |
| PUT | `/api/profile/password` | Authentifié |
| POST | `/api/profile/photo` | Authentifié |
| GET | `/api/dashboard/stats` | Authentifié |
| GET/POST/PUT/DELETE | `/api/utilisateurs/**` | ADMIN |
| PATCH | `/api/utilisateurs/{id}/desactiver`\|`reactiver`\|`deverrouiller` | ADMIN |

---

## Tests

```bash
mvn test
```

Les tests tournent sur une base **H2 en mémoire** (`src/test/resources/application.yml`), aucun impact sur la base MySQL réelle.

---

## Hors périmètre actuel (pour le binôme / itérations futures)

- Gestion des dossiers judiciaires (CRUD, recherche multicritère, archivage)
- Gestion des documents/pièces jointes
- Journal d'audit / traçabilité des actions sensibles
- Les entités `DossierJudiciaire` et `Document` ainsi que leurs repositories existent déjà et sont alignées sur le schéma MySQL réel — il reste à construire les DTOs, services et contrôleurs correspondants en suivant l'architecture en place (voir `UtilisateurService`/`UtilisateurController` comme modèle).
