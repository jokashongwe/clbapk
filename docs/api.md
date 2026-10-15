# Documentation API — CLB API

API de consultation en **lecture seule** de la base de données de l'application École La Bonté (`Ecole_La_Bonte_4`).  
Toutes les réponses sont au format **JSON**.

---

## Sommaire

- [Authentification](#authentification)
- [Authentification parent (téléphone + PIN)](#authentification-parent-téléphone--pin)
- [Conventions](#conventions)
- [Codes de réponse](#codes-de-réponse)
- [Abonnements](#abonnements)
- [Absences agents](#absences-agents)
- [Absences élèves](#absences-élèves)
- [Élèves](#élèves)
- [Paiements](#paiements)
- [Tarifications](#tarifications)
- [Annonces aux parents](#annonces-aux-parents)
- [Devoirs (fichiers par classe)](#devoirs-fichiers-par-classe)
- [Notifications push (Firebase)](#notifications-push-firebase)

---

## Authentification

Les endpoints `/api/*` (sauf login et changement de PIN) exigent une authentification via l'un des deux modes ci-dessous.

### 1. Token de session parent (après login téléphone + PIN)

Utilisez le `token` retourné par `POST /api/auth/login` :

| En-tête | Exemple |
|---------|---------|
| `Authorization` | `Authorization: Bearer {token}` |
| `X-API-KEY` | `X-API-KEY: {token}` |

### 2. Token API technique (intégrations / admin)

| En-tête | Exemple |
|---------|---------|
| `X-API-KEY` | `X-API-KEY: votre-token` |
| `Authorization` | `Authorization: Bearer votre-token` |

Configuré via `API_TOKEN` dans `.env.local`.

**Réponse en cas d'échec (401) :**

```json
{
  "error": "Token d'authentification manquant."
}
```

```json
{
  "error": "Token d'authentification invalide."
}
```

---

## Authentification parent (téléphone + PIN)

Les parents s'authentifient avec le **numéro de téléphone du tuteur** (`parent_eleve.numero_telephone_tuteur`) et un **PIN** (4 à 6 chiffres).

- Si le parent n'a jamais changé son PIN, le **PIN par défaut** (`DEFAULT_PIN` dans `.env`) est accepté.
- Le numéro doit correspondre à un **tuteur actif** existant dans `parent_eleve.numero_telephone_tuteur` (comparaison sur les chiffres uniquement).
- Les PIN et sessions sont stockés dans la **base MySQL** (`parent_pin`, `parent_session`), avec clé étrangère vers `parent_eleve.id`.

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DEFAULT_PIN` | PIN initial pour les parents sans PIN personnalisé | `1234` |
| `API_SESSION_TTL` | Durée de validité du token de session (secondes) | `86400` (24 h) |

### Connexion

```
POST /api/auth/login
```

**Corps JSON :**

```json
{
  "telephone": "+243997031460",
  "pin": "1234"
}
```

**Réponse (200) :**

```json
{
  "token": "a1b2c3...",
  "expires_at": "2026-06-19T16:00:00+00:00",
  "parent": {
    "id": 1007,
    "nomTuteur": "ELIE KAKUDJI",
    "numeroTelephoneTuteur": "+243997031460"
  }
}
```

**Exemple :**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telephone":"+243997031460","pin":"1234"}'
```

Utilisez ensuite le `token` pour les autres endpoints :

```bash
curl -H "Authorization: Bearer a1b2c3..." http://localhost:8000/api/eleves/by-parent/1007
```

### Changer le PIN

```
POST /api/auth/change-pin
```

**Corps JSON :**

```json
{
  "telephone": "+243997031460",
  "current_pin": "1234",
  "new_pin": "5678"
}
```

| Champ | Description |
|-------|-------------|
| `telephone` | Numéro du tuteur |
| `current_pin` | PIN actuel (ou PIN par défaut si jamais modifié) |
| `new_pin` | Nouveau PIN (4 à 6 chiffres) |

**Réponse (200) :**

```json
{
  "message": "PIN modifié avec succès."
}
```

**Exemple :**

```bash
curl -X POST http://localhost:8000/api/auth/change-pin \
  -H "Content-Type: application/json" \
  -d '{"telephone":"+243997031460","current_pin":"1234","new_pin":"5678"}'
```

---


## Conventions

| Élément | Valeur |
|---------|--------|
| URL de base (dev) | `http://localhost:8000` |
| Préfixe API | `/api` |
| Méthodes HTTP | `GET` (consultation) et `POST` (auth) |
| Encodage | UTF-8 |
| Dates | ISO 8601 (`2025-07-09T13:08:34+00:00`) |

### Lancer le serveur local

```bash
php -S localhost:8000 -t public
```

### Exemple de requête

```bash
curl -H "X-API-KEY: votre-token" http://localhost:8000/api/eleves/1868
```

---

## Codes de réponse

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `400` | Paramètre manquant ou invalide |
| `401` | Token API manquant ou invalide |
| `404` | Ressource introuvable |

---

## Abonnements

### Liste des abonnements

```
GET /api/abonnements
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `actif` | bool | Non | Si `1` ou `true`, retourne uniquement les abonnements dont la date du jour est entre `datedebut` et `datefin` |

**Exemple :**

```bash
curl -H "X-API-KEY: votre-token" "http://localhost:8000/api/abonnements?actif=1"
```

**Réponse (extrait) :**

```json
[
  {
    "id": 1,
    "cle": "cle-abonnement",
    "datedebut": "2025-01-01T00:00:00+00:00",
    "datefin": "2025-12-31T23:59:59+00:00"
  }
]
```

---

### Détail d'un abonnement

```
GET /api/abonnements/{id}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | Identifiant de l'abonnement |

---

## Absences agents

Absences du personnel (table `absences`), liées à une affectation agent et un type d'absence.

### Liste des absences agents

```
GET /api/absences
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `agentaffectation_id` | int | Non | Filtre par identifiant d'affectation agent |

---

### Détail d'une absence agent

```
GET /api/absences/{id}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | Identifiant de l'absence |

**Réponse (extrait) :**

```json
{
  "id": 1,
  "agentaffectationId": 12,
  "typeAbsence": {
    "id": 1,
    "libelle": "Maladie"
  },
  "observation": "..."
}
```

---

## Absences élèves

Présences / absences des élèves (table `absence_eleve`).  
Le champ `eleve` contient le **nom** de l'élève (texte), pas son identifiant.

### Liste des absences élèves

```
GET /api/absences-eleves
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `eleve` | string | Non | Recherche partielle sur le nom de l'élève |
| `classe` | string | Non | Recherche partielle sur la classe |
| `section` | string | Non | Recherche partielle sur la section |
| `anneescolaire` | string | Non | Année scolaire exacte (ex. `2025/2026`) |
| `statut` | string | Non | Statut exact |
| `date_debut` | date | Non | Date minimale d'absence (ex. `2025-09-01`) |
| `date_fin` | date | Non | Date maximale d'absence |

**Exemple :**

```bash
curl -H "X-API-KEY: votre-token" \
  "http://localhost:8000/api/absences-eleves?anneescolaire=2025/2026&classe=6e"
```

**Réponse (extrait) :**

```json
[
  {
    "id": 1,
    "section": "Primaire",
    "classe": "6e A",
    "eleve": "GIFT BONDO KAKUDJI",
    "statut": "Absent",
    "dateAbsence": "2025-10-15T08:00:00+00:00",
    "anneescolaire": "2025/2026"
  }
]
```

---

## Élèves

### Recherche par téléphone du tuteur

```
GET /api/eleves?numero_telephone_tuteur={telephone}
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `numero_telephone_tuteur` | string | **Oui** | Numéro du tuteur (`parent_eleve.numero_telephone_tuteur`). Les caractères non numériques sont ignorés lors de la comparaison. |

Ne retourne que les élèves inscrits pour l'**année scolaire en cours** (`inscription.anneescolaire` = libellé de `annee_scolaire`, ex. `2025/2026`) et sans inscription active de type **`Quitter`** pour cette année.

**Exemple :**

```bash
curl -H "X-API-KEY: votre-token" \
  "http://localhost:8000/api/eleves?numero_telephone_tuteur=%2B243997031460"
```

---

### Élèves par parent

```
GET /api/eleves/by-parent/{parentId}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `parentId` | int | Identifiant du parent (`parent_eleve.id`) |

Retourne les élèves actifs (`supp = 0`) rattachés à ce parent, inscrits pour l'année scolaire en cours et **sans** inscription `Quitter` pour cette année.

---

### Absences d'un élève

```
GET /api/eleves/{eleveId}/absences
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `eleveId` | int | Identifiant de l'élève |

Recherche dans `absence_eleve` en croisant l'ID élève avec plusieurs formats de nom possibles (prénom, nom, post-nom, matricule).

---

### Détail d'un élève

```
GET /api/eleves/{id}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | Identifiant de l'élève |

**Réponse (extrait) :**

```json
{
  "id": 1868,
  "parent": {
    "id": 1007,
    "nomTuteur": "ELIE KAKUDJI",
    "numeroTelephoneTuteur": "+243997031460"
  },
  "classeId": 42,
  "nom": "BONDO",
  "postNom": "KAKUDJI",
  "prenom": "GIFT",
  "sexe": "Masculin",
  "matricule": "202512496NU182008",
  "dateNaissance": "2008-03-27",
  "supp": false,
  "familleId": null
}
```

---

## Paiements

### Liste des paiements (filtres combinables)

```
GET /api/paiements
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `eleve_id` | int | Non | Filtre par élève |
| `tarification_id` | int | Non | Filtre par tarification |
| `mois` | string | Non | Filtre par mois exact (ex. `July`, `pas de mois`) |

**Exemple :**

```bash
curl -H "X-API-KEY: votre-token" \
  "http://localhost:8000/api/paiements?eleve_id=1868&mois=July"
```

---

### Paiements d'un élève pour une année scolaire

```
GET /api/paiements/eleve/{eleveId}/annee-scolaire/{anneescolaireId}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `eleveId` | int | Identifiant de l'élève |
| `anneescolaireId` | int | Identifiant de l'année scolaire (`annee_scolaire.id`) |

Filtre sur le champ `paiement.anneescolaire_id`.

**Exemple :**

```bash
curl -H "X-API-KEY: votre-token" \
  http://localhost:8000/api/paiements/eleve/1868/annee-scolaire/4
```

---

### Paiements d'un élève pour l'année scolaire en cours

```
GET /api/paiements/eleve/{eleveId}/annee-scolaire-courante
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `eleveId` | int | Identifiant de l'élève |

L'année en cours est déterminée par le statut `En Cours` dans `annee_scolaire`, ou à défaut par les dates `date_debut` / `date_fin` englobant la date du jour.

**Réponse :**

```json
{
  "annee_scolaire": {
    "id": 4,
    "status": "En Cours",
    "anneeScolaire": "2025/2026",
    "dateDebut": "2025-09-01",
    "dateFin": "2026-07-02"
  },
  "paiements": [ ... ]
}
```

---

### Paiements d'un élève par mois

```
GET /api/paiements/eleve/{eleveId}/mois/{mois}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `eleveId` | int | Identifiant de l'élève |
| `mois` | string | Valeur exacte du champ `paiement.mois` |

**Exemples :**

```bash
curl -H "X-API-KEY: votre-token" \
  http://localhost:8000/api/paiements/eleve/1868/mois/July

curl -H "X-API-KEY: votre-token" \
  "http://localhost:8000/api/paiements/eleve/1868/mois/pas%20de%20mois"
```

---

### Détail d'un paiement

```
GET /api/paiements/{id}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | Identifiant du paiement |

**Réponse (extrait) :**

```json
{
  "id": 16570,
  "tarification": {
    "id": 5,
    "nom": "Inscription",
    "devise": "USD"
  },
  "eleve": { "id": 1868, "nom": "BONDO", "prenom": "GIFT" },
  "detail": null,
  "montantUsd": "100.00",
  "montantFc": "0.00",
  "montant": null,
  "datepaiement": "2025-07-09T13:09:36+00:00",
  "numRecu": "1868266095972025",
  "mois": "July",
  "anneescolaireId": 4,
  "typePaiement": null
}
```

---

## Tarifications

### Liste des tarifications

```
GET /api/tarifications
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | Non | Recherche partielle sur le nom (ex. `Inscription`) |

---

### Détail d'une tarification

```
GET /api/tarifications/{id}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | Identifiant de la tarification |

**Réponse (extrait) :**

```json
{
  "id": 5,
  "nom": "Inscription",
  "section": ["Tous"],
  "isPaiementDirect": true,
  "devise": "USD"
}
```

---

## Récapitulatif des endpoints

| Méthode | Endpoint |
|---------|----------|
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/change-pin` |
| `GET` | `/api/abonnements` |
| `GET` | `/api/abonnements/{id}` |
| `GET` | `/api/absences` |
| `GET` | `/api/absences/{id}` |
| `GET` | `/api/absences-eleves` |
| `GET` | `/api/eleves?numero_telephone_tuteur=` |
| `GET` | `/api/eleves/by-parent/{parentId}` |
| `GET` | `/api/eleves/{eleveId}/absences` |
| `GET` | `/api/eleves/{id}` |
| `GET` | `/api/paiements` |
| `GET` | `/api/paiements/eleve/{eleveId}/annee-scolaire/{anneescolaireId}` |
| `GET` | `/api/paiements/eleve/{eleveId}/annee-scolaire-courante` |
| `GET` | `/api/paiements/eleve/{eleveId}/mois/{mois}` |
| `GET` | `/api/paiements/{id}` |
| `GET` | `/api/tarifications` |
| `GET` | `/api/tarifications/{id}` |
| `POST` | `/api/annonces` *(directeur)* |
| `GET` | `/api/annonces` *(parent — non lues)* |
| `POST` | `/api/annonces/{id}/read` *(parent)* |
| `POST` | `/api/annonces/read-all` *(parent)* |
| `POST` | `/api/devoirs` *(directeur — multipart)* |
| `GET` | `/api/devoirs` |
| `GET` | `/api/devoirs/{id}` |
| `GET` | `/api/devoirs/{id}/download-url` |
| `POST` | `/api/push/devices` *(parent — enregistrer token FCM)* |
| `POST` | `/api/push/devices/unregister` *(parent)* |

---

## Annonces aux parents

Communication ciblée vers les parents : **Information**, **Rappel** ou **Convocation**.  
Les annonces apparaissent dans la liste **non lue** du parent tant qu’il n’a pas appelé **read** (une annonce) ou **read-all** (toutes les siennes).

Tables dédiées : `annonce`, `annonce_lecture` (migration Doctrine).

### Types

| `type` | Libellé |
|--------|---------|
| `Information` | Informations |
| `Rappel` | Rappels |
| `Convocation` | Convocations |

### Ciblage (`cibleType`)

| `cibleType` | `cibleId` | Portée |
|-------------|-----------|--------|
| `tous` | *(omis)* | Tous les parents connectés |
| `eleve` | id élève | Parent(s) de cet élève (inscription active, hors « Quitter ») |
| `classe` | id classe | Parents ayant au moins un enfant dans cette classe |
| `option` | id **catégorie** (`categorie.id`, filière / option) | Parents ayant au moins un enfant dans une classe de cette catégorie |

Le filtre d’inscription reprend la même logique que la liste des élèves (année scolaire en cours, pas de type `Quitter`).

### Créer une annonce *(ROLE_DIRECTEUR — session login directeur)*

```
POST /api/annonces
```

**Corps JSON :**

```json
{
  "type": "Information",
  "titre": "Réunion parents",
  "contenu": "Merci de vous présenter vendredi à 14h.",
  "cibleType": "classe",
  "cibleId": 12
}
```

Alias acceptés : `cible_type`, `cible_id`.

**Réponse (201)** : objet annonce (groupe `read`).

Après création, l’API envoie une **notification push** Firebase aux parents ciblés qui ont enregistré un appareil (`POST /api/push/devices`).

### Liste non lue *(session parent)*

```
GET /api/annonces
```

Retourne uniquement les annonces **non lues** et **ciblées** pour le parent authentifié, triées par date décroissante.  
Le token technique (`API_TOKEN`) ne suffit pas : il faut le token de session après login parent.

### Marquer comme lue

```
POST /api/annonces/{id}/read
```

**Réponse :** `{ "ok": true }` (404 si annonce absente ou non visible pour ce parent).

```
POST /api/annonces/read-all
```

Marque comme lues toutes les annonces non lues visibles pour le parent.

**Réponse :** `{ "ok": true, "markedCount": 3 }`

---

## Devoirs (fichiers par classe)

Partage de **devoirs** (fichiers **PDF** ou **Word**) ciblés par **classe**.  
Les fichiers sont stockés dans un bucket **Cloudflare R2** ; l’API enregistre les métadonnées en base (`devoir`).

### Formats acceptés

- PDF (`.pdf`)
- Word (`.doc`, `.docx`)

Taille max : `DEVOIR_MAX_UPLOAD_BYTES` (défaut 20 Mo).

### Publier un devoir *(ROLE_DIRECTEUR)*

```
POST /api/devoirs
Content-Type: multipart/form-data
```

| Champ | Obligatoire | Description |
|-------|-------------|-------------|
| `file` | oui | Fichier PDF ou Word |
| `titre` | oui | Titre affiché |
| `classeId` | oui | Id de la classe (`classe.id`) |
| `description` | non | Texte complémentaire |

**Réponse (201)** : objet devoir (groupe `read`, sans clé de stockage interne).

Une **notification push** est envoyée aux parents de la classe (élèves inscrits actifs) ayant un token FCM enregistré.

### Lister les devoirs

```
GET /api/devoirs
GET /api/devoirs?classeId=42
```

- **Parent** : devoirs des classes où il a au moins un enfant inscrit (même filtre inscription que les élèves). Sans `classeId`, toutes les classes concernées ; avec `classeId`, filtre sur une classe (404 si aucun enfant dans cette classe).
- **Directeur** : `classeId` **obligatoire** — liste tous les devoirs publiés pour cette classe.

Session parent requise (pas le seul `API_TOKEN`).

### Détail et téléchargement

```
GET /api/devoirs/{id}
```

```
GET /api/devoirs/{id}/download-url
```

Retourne une URL **présignée** R2 (durée `R2_PRESIGNED_URL_TTL`, défaut 3600 s) :

```json
{
  "downloadUrl": "https://…",
  "expiresInSeconds": 3600,
  "filename": "devoir-maths.pdf",
  "mimeType": "application/pdf"
}
```

Le client mobile / web ouvre cette URL pour télécharger le fichier.

---

## Notifications push (Firebase)

Notifications **Firebase Cloud Messaging (HTTP v1)** pour l’app mobile parent.

### Enregistrer un appareil *(session parent, après login)*

```
POST /api/push/devices
```

**Corps JSON :**

```json
{
  "token": "fcm-device-token",
  "platform": "android"
}
```

`platform` : `android` ou `ios`.

**Réponse (201)** : `{ "ok": true, "id": 1, "platform": "android" }`

Un même token est réattribué au parent courant s’il change de compte sur l’appareil.

### Désenregistrer

```
POST /api/push/devices/unregister
```

```json
{ "token": "fcm-device-token" }
```

### Déclenchement automatique

| Événement | Destinataires | Données `data` (toutes en string) |
|-----------|---------------|-----------------------------------|
| Création annonce | Même ciblage que l’annonce | `type=annonce`, `annonceId`, `annonceType` |
| Publication devoir | Parents de la classe | `type=devoir`, `devoirId`, `classeId` |

Si `FIREBASE_CREDENTIALS` n’est pas configuré, les push sont ignorés (l’API répond quand même 201 à la création).

---

## Configuration

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connexion MySQL vers la base externe `Ecole_La_Bonte_4` |
| `API_TOKEN` | Token technique pour intégrations (alternative au login parent) |
| `DEFAULT_PIN` | PIN par défaut des parents (avant première modification) |
| `API_SESSION_TTL` | Durée du token de session parent (secondes) |
| `R2_ACCOUNT_ID` | Identifiant compte Cloudflare (R2) |
| `R2_ACCESS_KEY_ID` | Clé d’accès R2 |
| `R2_SECRET_ACCESS_KEY` | Secret R2 |
| `R2_BUCKET` | Nom du bucket |
| `R2_PRESIGNED_URL_TTL` | Validité des URLs de téléchargement (secondes) |
| `DEVOIR_MAX_UPLOAD_BYTES` | Taille max upload devoir (octets) |
| `FIREBASE_CREDENTIALS` | Chemin vers le JSON compte de service Firebase (FCM) |

Les tables `parent_pin`, `parent_session`, `annonce`, `annonce_lecture`, `devoir` et `parent_push_device` sont créées dans la même base MySQL (`Ecole_La_Bonte_4`) :

```bash
php bin/console doctrine:migrations:migrate
```

### Collection Postman

Importer dans Postman :

- `postman/CLB-API.postman_collection.json` — tous les endpoints
- `postman/CLB-API.local.postman_environment.json` — variables locales (optionnel)

1. Définir `apiToken` ou exécuter **Auth > Login** (le token de session est enregistré automatiquement).
2. Lancer les requêtes protégées.

Exemple `.env.local` :

```env
DATABASE_URL="mysql://user:password@host:3306/Ecole_La_Bonte_4?serverVersion=8.0.32&charset=utf8mb4"
API_TOKEN="votre-token-secret"
DEFAULT_PIN="1234"
API_SESSION_TTL=86400
R2_ACCOUNT_ID="votre-account-id"
R2_ACCESS_KEY_ID="…"
R2_SECRET_ACCESS_KEY="…"
R2_BUCKET="clb-devoirs"
R2_PRESIGNED_URL_TTL=3600
DEVOIR_MAX_UPLOAD_BYTES=20971520
FIREBASE_CREDENTIALS="config/firebase/service-account.json"
```

Placer le fichier compte de service Firebase (non versionné) dans `config/firebase/` — voir [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send-message).
