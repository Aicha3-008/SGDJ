import axiosClient from "./axiosClient";

// ======================================================
// DOCUMENTS
// ======================================================

// Lister les documents d'un dossier
export function listDocumentsByDossier(dossierId) {
    return axiosClient
        .get(`/documents/dossier/${dossierId}`)
        .then((res) => res.data);
}

// Ajouter un document à un dossier
export function uploadDocument(dossierId, file) {
    const formData = new FormData();

    formData.append("file", file);

    return axiosClient
        .post(
            `/documents/dossier/${dossierId}`,
            formData
        )
        .then((res) => res.data);
}

// Télécharger un document
export function downloadDocument(id, nomFichier) {
    return axiosClient
        .get(`/documents/${id}/download`, {
            responseType: "blob",
        })
        .then((res) => {
            const blob = new Blob(
                [res.data],
                {
                    type:
                        res.headers["content-type"] ||
                        "application/octet-stream",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                nomFichier || "document"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            return res;
        });
}

// Supprimer un document
export function deleteDocument(id) {
    return axiosClient
        .delete(`/documents/${id}`)
        .then((res) => res.data);
}

// Archiver un dossier
export function archiveDossier(id) {
    return axiosClient
        .post(`/dossiers/${id}/archive`)
        .then((res) => res.data);
}