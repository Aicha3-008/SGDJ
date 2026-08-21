import axiosClient from "./axiosClient";

// Consulter tous les dossiers
export function getAllDossiers({ page = 0, size = 10 } = {}) {
    return axiosClient
        .get("/dossiers", {
            params: { page, size },
        })
        .then((res) => res.data);
}

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

// Filtrer par statut
export function getDossiersByStatut(
    statut,
    { page = 0, size = 10 } = {}
) {
    return axiosClient
        .get(`/dossiers/statut/${statut}`, {
            params: { page, size },
        })
        .then((res) => res.data);
}

// Consulter un dossier
export function getDossier(id) {
    return axiosClient
        .get(`/dossiers/${id}`)
        .then((res) => res.data);
}

// Créer un dossier
export function createDossier(payload) {
    return axiosClient
        .post("/dossiers", payload)
        .then((res) => res.data);
}

// Modifier un dossier
export function updateDossier(id, payload) {
    return axiosClient
        .put(`/dossiers/${id}`, payload)
        .then((res) => res.data);
}

// Supprimer un dossier
export function deleteDossier(id) {
    return axiosClient
        .delete(`/dossiers/${id}`)
        .then((res) => res.data);
}

// Archiver un dossier
export function archiveDossier(id) {
    return axiosClient
        .post(`/dossiers/${id}/archive`)
        .then((res) => res.data);
}
