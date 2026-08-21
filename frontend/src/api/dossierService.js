import axiosClient from "./axiosClient";

// ======================================================
// DOSSIERS
// ======================================================

// Consulter tous les dossiers
export function getAllDossiers({
                                   page = 0,
                                   size = 10,
                               } = {}) {

    return axiosClient
        .get("/dossiers", {
            params: {
                page,
                size,
            },
        })
        .then((res) => res.data);
}


// ======================================================
// RECHERCHE
// ======================================================

// Recherche par numéro OU objet
export function searchDossiers({
                                   query = "",
                                   page = 0,
                                   size = 10,
                               } = {}) {

    return axiosClient
        .get("/dossiers/search", {
            params: {
                numeroDossier: query,
                objet: query,
                page,
                size,
            },
        })
        .then((res) => res.data);
}


// ======================================================
// FILTRE PAR STATUT
// ======================================================

// Filtrer par statut
export function getDossiersByStatut(
    statut,
    {
        page = 0,
        size = 10,
    } = {}
) {

    return axiosClient
        .get(`/dossiers/statut/${statut}`, {
            params: {
                page,
                size,
            },
        })
        .then((res) => res.data);
}


// ======================================================
// CONSULTER UN DOSSIER
// ======================================================

// Consulter un dossier
export function getDossier(id) {

    return axiosClient
        .get(`/dossiers/${id}`)
        .then((res) => res.data);
}


// ======================================================
// CRÉER UN DOSSIER
// ======================================================

// Créer un dossier
export function createDossier(payload) {

    return axiosClient
        .post("/dossiers", payload)
        .then((res) => res.data);
}


// ======================================================
// MODIFIER UN DOSSIER
// ======================================================

// Modifier un dossier
export function updateDossier(
    id,
    payload
) {

    return axiosClient
        .put(`/dossiers/${id}`, payload)
        .then((res) => res.data);
}


// ======================================================
// SUPPRIMER UN DOSSIER
// ======================================================

// Supprimer un dossier
export function deleteDossier(id) {

    return axiosClient
        .delete(`/dossiers/${id}`)
        .then((res) => res.data);
}


// ======================================================
// ARCHIVER UN DOSSIER
// ======================================================

// Archiver un dossier
export function archiveDossier(id) {

    return axiosClient
        .post(`/dossiers/${id}/archive`)
        .then((res) => res.data);
}


// ======================================================
// TÉLÉCHARGER UN DOSSIER EN PDF
// ======================================================

export function downloadDossierPdf(
    id,
    numeroDossier
) {

    return axiosClient
        .get(`/dossiers/${id}/pdf`, {
            responseType: "blob",
        })
        .then((res) => {

            // Création du fichier PDF
            const blob = new Blob(
                [res.data],
                {
                    type: "application/pdf",
                }
            );

            // Création d'une URL temporaire
            const url =
                window.URL.createObjectURL(blob);

            // Création du lien
            const link =
                document.createElement("a");

            link.href = url;

            // Nom du fichier
            link.setAttribute(
                "download",
                `dossier-${numeroDossier || id}.pdf`
            );

            // Lancer le téléchargement
            document.body.appendChild(link);

            link.click();

            // Nettoyage
            link.remove();

            window.URL.revokeObjectURL(url);

            return res;
        });
}